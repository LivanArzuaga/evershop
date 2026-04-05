import axios from 'axios';
import { select, update } from '@evershop/postgres-query-builder';
import { debug, error } from '../../../../lib/log/logger.js';
import { pool } from '../../../../lib/postgres/connection.js';
import { buildUrl } from '../../../../lib/router/buildUrl.js';
import { getConfig } from '../../../../lib/util/getConfig.js';
import {
  INTERNAL_SERVER_ERROR,
  INVALID_PAYLOAD,
  OK
} from '../../../../lib/util/httpStatus.js';
import { EvershopRequest } from '../../../../types/request.js';
import { EvershopResponse } from '../../../../types/response.js';
import { getContextValue } from '../../../graphql/services/contextHelper.js';
import { getSetting } from '../../../setting/services/setting.js';
import { toPrice } from '../../checkout/services/toPrice.js';
import { getApiBaseUrl, getAuthBaseUrl } from '../../services/getApiBaseUrl.js';

export default async (
  request: EvershopRequest,
  response: EvershopResponse,
  next
) => {
  try {
    const { order_id } = request.body;
    const order = await select()
      .from('order')
      .where('uuid', '=', order_id)
      .and('payment_method', '=', 'openpay')
      .and('payment_status', '=', 'pending')
      .load(pool);

    if (!order) {
      return response.status(INVALID_PAYLOAD).json({
        error: {
          status: INVALID_PAYLOAD,
          message: 'Invalid order'
        }
      });
    }

    const openpayConfig = getConfig('system.openpay', {}) as {
      clientId?: string;
      clientSecret?: string;
    };

    let clientId = openpayConfig.clientId;
    let clientSecret = openpayConfig.clientSecret;

    if (!clientId) {
      clientId = await getSetting('openpayClientId', '');
    }
    if (!clientSecret) {
      clientSecret = await getSetting('openpayClientSecret', '');
    }

    if (!clientId || !clientSecret) {
      return response.status(INVALID_PAYLOAD).json({
        error: {
          status: INVALID_PAYLOAD,
          message: 'Openpay is not configured correctly'
        }
      });
    }

    // Get JWT token first
    const authResponse = await axios.post(
      `${await getAuthBaseUrl()}/oauth/token`,
      {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: '*'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const { access_token } = authResponse.data;

    // Convert amount to cents (Openpay Argentina expects amounts in cents)
    const amountInCents = Math.round(parseFloat(toPrice(order.grand_total)) * 100);

    const orderData = {
      data: {
        attributes: {
          currency: '032', // ARS currency code
          items: [
            {
              id: 1,
              name: `Order ${order.uuid}`,
              unitPrice: {
                currency: '032',
                amount: amountInCents
              },
              quantity: 1
            }
          ]
        }
      }
    };

    const { data } = await axios.post(
      `${await getApiBaseUrl()}/api/v2/orders`,
      orderData,
      {
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json',
          'Authorization': `Bearer ${access_token}`
        }
      }
    );

    if (data?.data?.id) {
      const orderUuid = data.data.attributes.uuid;
      const checkoutUrl = data.data.links.checkout;

      await update('order')
        .given({ integration_order_id: orderUuid })
        .where('uuid', '=', order_id)
        .execute(pool);

      return response.status(OK).json({
        data: {
          openpayOrderId: orderUuid,
          approveUrl: checkoutUrl
        }
      });
    }

    debug('Openpay create order error');
    debug(data);
    await update('cart')
      .given({ status: true })
      .where('cart_id', '=', order.cart_id)
      .execute(pool);
    return response.status(INTERNAL_SERVER_ERROR).json({
      error: {
        status: INTERNAL_SERVER_ERROR,
        message: data?.message || 'Unable to create Openpay order'
      }
    });
  } catch (err) {
    error(err);
    return next(err);
  }
};
