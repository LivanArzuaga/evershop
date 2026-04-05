import axios from 'axios';
import { select, update } from '@evershop/postgres-query-builder';
import { debug, error } from '../../../../lib/log/logger.js';
import { pool } from '../../../../lib/postgres/connection.js';
import { INVALID_PAYLOAD, INTERNAL_SERVER_ERROR, OK } from '../../../../lib/util/httpStatus.js';
import { EvershopRequest } from '../../../../types/request.js';
import { EvershopResponse } from '../../../../types/response.js';
import { getContextValue } from '../../../graphql/services/contextHelper.js';
import {
  buildHostedPaymentPayload,
  buildPaymentsCollectionUrl,
  extractApproveUrl,
  extractTransactionId,
  getIsracardConfig,
  getRequestConfig
} from '../../services/isracard.js';

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
      .and('payment_method', '=', 'isracard')
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

    const isracardConfig = await getIsracardConfig();
    if (!isracardConfig.apiBaseUrl) {
      return response.status(INVALID_PAYLOAD).json({
        error: {
          status: INVALID_PAYLOAD,
          message: 'Isracard is not configured correctly'
        }
      });
    }

    const homeUrl = getContextValue<string>(request, 'homeUrl', '');
    const payload = buildHostedPaymentPayload(order, homeUrl, isracardConfig);
    const requestConfig = getRequestConfig(isracardConfig);

    // The exact request contract for Isracard lives behind authenticated docs.
    // This hosted-payment payload keeps the provider-specific logic localized.
    const { data } = await axios.post(
      buildPaymentsCollectionUrl(isracardConfig.apiBaseUrl),
      payload,
      {
        ...requestConfig,
        validateStatus: (status) => status < 500
      }
    );

    const approveUrl = extractApproveUrl(data);
    const integrationOrderId = extractTransactionId(data) || order.uuid;

    if (!approveUrl) {
      debug('Isracard create order error');
      debug(data);
      await update('cart')
        .given({ status: true })
        .where('cart_id', '=', order.cart_id)
        .execute(pool);

      return response.status(INTERNAL_SERVER_ERROR).json({
        error: {
          status: INTERNAL_SERVER_ERROR,
          message:
            data?.message ||
            'Unable to create Isracard payment session'
        }
      });
    }

    await update('order')
      .given({ integration_order_id: integrationOrderId })
      .where('uuid', '=', order_id)
      .execute(pool);

    return response.status(OK).json({
      data: {
        isracardPaymentId: integrationOrderId,
        approveUrl
      }
    });
  } catch (err) {
    error(err);
    return next(err);
  }
};
