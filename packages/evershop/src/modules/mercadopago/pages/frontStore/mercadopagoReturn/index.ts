import { emit } from '../../../../../lib/event/emitter.js';
import { select, update } from '@evershop/postgres-query-builder';
import { pool } from '../../../../../lib/postgres/connection.js';
import { buildUrl } from '../../../../../lib/router/buildUrl.js';
import { EvershopRequest } from '../../../../../types/request.js';
import { EvershopResponse } from '../../../../../types/response.js';
import { normalizeMercadoPagoStatus } from '../../../services/mercadopago.js';

export default async (
  request: EvershopRequest,
  response: EvershopResponse,
  next: (error?: any) => void
) => {
  try {
    const { order_id } = request.params;
    const status = normalizeMercadoPagoStatus(request.query.status);
    const order = await select()
      .from('order')
      .where('uuid', '=', order_id)
      .and('payment_method', '=', 'mercadopago')
      .load(pool);

    if (!order) {
      response.redirect(302, buildUrl('homepage'));
      return;
    }

    if (status === 'approved') {
      await update('order')
        .given({ payment_status: 'mercadopago_captured' })
        .where('uuid', '=', order_id)
        .execute(pool);

      await emit('order_placed', order);
      response.redirect(302, `${buildUrl('checkoutSuccess')}/${order_id}`);
      return;
    }

    if (status === 'pending' || status === 'in_process') {
      await update('order')
        .given({ payment_status: 'mercadopago_pending' })
        .where('uuid', '=', order_id)
        .execute(pool);

      response.redirect(302, buildUrl('homepage'));
      return;
    }

    if (status) {
      await update('order')
        .given({ payment_status: 'mercadopago_failed' })
        .where('uuid', '=', order_id)
        .execute(pool);
    }

    response.redirect(302, buildUrl('homepage'));
  } catch (error) {
    next(error);
  }
};
