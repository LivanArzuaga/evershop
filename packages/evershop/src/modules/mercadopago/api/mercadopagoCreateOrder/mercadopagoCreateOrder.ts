import axios from 'axios';
import { select, update } from '@evershop/postgres-query-builder';
import { debug, error } from '../../../../lib/log/logger.js';
import { pool } from '../../../../lib/postgres/connection.js';
import { buildAbsoluteUrl } from '../../../../lib/router/buildAbsoluteUrl.js';
import {
  INTERNAL_SERVER_ERROR,
  INVALID_PAYLOAD,
  OK
} from '../../../../lib/util/httpStatus.js';
import { EvershopRequest } from '../../../../types/request.js';
import { EvershopResponse } from '../../../../types/response.js';
import { toPrice } from '../../../checkout/services/toPrice.js';
import { getMercadoPagoConfig, getMercadoPagoHeaders } from '../../services/mercadopago.js';

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
      .and('payment_method', '=', 'mercadopago')
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

    const items = await select()
      .from('order_item')
      .where('order_item_order_id', '=', order.order_id)
      .execute(pool);

    const mercadoPagoConfig = await getMercadoPagoConfig();

    if (!mercadoPagoConfig.accessToken) {
      return response.status(INVALID_PAYLOAD).json({
        error: {
          status: INVALID_PAYLOAD,
          message: 'Mercado Pago is not configured correctly'
        }
      });
    }

    const preferenceBody = {
      items: items.map((item) => ({
        id: item.product_sku,
        title: item.product_name,
        quantity: Number(item.qty),
        currency_id: order.currency,
        unit_price: Number(toPrice(item.final_price))
      })),
      external_reference: order.uuid,
      back_urls: {
        success: buildAbsoluteUrl('mercadopagoReturn', { order_id }),
        failure: buildAbsoluteUrl('mercadopagoReturn', { order_id }),
        pending: buildAbsoluteUrl('mercadopagoReturn', { order_id })
      },
      auto_return: 'approved',
      notification_url: buildAbsoluteUrl('mercadopagoReturn', { order_id }),
      payer: {
        email: order.customer_email || undefined,
        name: order.customer_full_name || undefined
      },
      shipments: order.shipping_fee_excl_tax
        ? {
            cost: Number(toPrice(order.shipping_fee_excl_tax))
          }
        : undefined
    };

    const { data } = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      preferenceBody,
      {
        headers: getMercadoPagoHeaders(mercadoPagoConfig.accessToken),
        validateStatus: (status) => status < 500
      }
    );

    const approveUrl =
      mercadoPagoConfig.sandboxMode === 1
        ? data?.sandbox_init_point || data?.init_point
        : data?.init_point || data?.sandbox_init_point;

    if (!data?.id || !approveUrl) {
      debug('Mercado Pago create preference error');
      debug(data);
      await update('cart')
        .given({ status: true })
        .where('cart_id', '=', order.cart_id)
        .execute(pool);

      return response.status(INTERNAL_SERVER_ERROR).json({
        error: {
          status: INTERNAL_SERVER_ERROR,
          message:
            data?.message || 'Unable to create Mercado Pago preference'
        }
      });
    }

    await update('order')
      .given({ integration_order_id: data.id })
      .where('uuid', '=', order_id)
      .execute(pool);

    return response.status(OK).json({
      data: {
        mercadoPagoPreferenceId: data.id,
        approveUrl
      }
    });
  } catch (err) {
    error(err);
    return next(err);
  }
};
