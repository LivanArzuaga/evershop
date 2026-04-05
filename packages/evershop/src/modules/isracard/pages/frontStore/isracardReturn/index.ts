import axios from 'axios';
import { emit } from '../../../../../lib/event/emitter.js';
import { select, update } from '@evershop/postgres-query-builder';
import { pool } from '../../../../../lib/postgres/connection.js';
import { buildUrl } from '../../../../../lib/router/buildUrl.js';
import { EvershopRequest } from '../../../../../types/request.js';
import { EvershopResponse } from '../../../../../types/response.js';
import {
  buildPaymentUrl,
  getIsracardConfig,
  getRequestConfig,
  isSuccessfulPaymentStatus
} from '../../../services/isracard.js';

export default async (
  request: EvershopRequest,
  response: EvershopResponse,
  next: (error?: any) => void
) => {
  const { order_id } = request.params;
  const order = await select()
    .from('order')
    .where('uuid', '=', order_id)
    .and('payment_method', '=', 'isracard')
    .and('payment_status', '=', 'pending')
    .load(pool);

  if (!order || !order.integration_order_id) {
    response.redirect(302, buildUrl('homepage'));
    return;
  }

  try {
    const queryStatus =
      `${request.query.status || request.query.payment_status || ''}`.toLowerCase();

    if (isSuccessfulPaymentStatus({}, queryStatus)) {
      await update('order')
        .given({ payment_status: 'isracard_captured' })
        .where('uuid', '=', order_id)
        .execute(pool);

      await emit('order_placed', order);
      response.redirect(302, `${buildUrl('checkoutSuccess')}/${order_id}`);
      return;
    }

    const isracardConfig = await getIsracardConfig();
    if (!isracardConfig.apiBaseUrl) {
      response.redirect(302, buildUrl('homepage'));
      return;
    }

    const { data } = await axios.get(
      buildPaymentUrl(
        isracardConfig.apiBaseUrl,
        `${order.integration_order_id || ''}`
      ),
      {
        ...getRequestConfig(isracardConfig),
        validateStatus: (status) => status < 500
      }
    );

    if (!isSuccessfulPaymentStatus(data)) {
      response.redirect(302, buildUrl('homepage'));
      return;
    }

    await update('order')
      .given({ payment_status: 'isracard_captured' })
      .where('uuid', '=', order_id)
      .execute(pool);

    await emit('order_placed', order);
    response.redirect(302, `${buildUrl('checkoutSuccess')}/${order_id}`);
  } catch (error) {
    next(error);
  }
};
