import axios from 'axios';
import { emit } from '../../../../../lib/event/emitter.js';
import { select, update } from '@evershop/postgres-query-builder';
import { pool } from '../../../../../lib/postgres/connection.js';
import { buildUrl } from '../../../../../lib/router/buildUrl.js';
import { getConfig } from '../../../../../lib/util/getConfig.js';
import { EvershopRequest } from '../../../../../types/request.js';
import { EvershopResponse } from '../../../../../types/response.js';
import { getContextValue } from '../../../../graphql/services/contextHelper.js';
import { getSetting } from '../../../../setting/services/setting.js';
import { getApiBaseUrl, getAuthBaseUrl } from '../../../services/getApiBaseUrl.js';

export default async (
  request: EvershopRequest,
  response: EvershopResponse,
  next: (error?: any) => void
) => {
  const { order_id } = request.params;
  const order = await select()
    .from('order')
    .where('uuid', '=', order_id)
    .and('payment_method', '=', 'openpay')
    .and('payment_status', '=', 'pending')
    .load(pool);

  if (!order || !order.integration_order_id) {
    response.redirect(302, buildUrl('homepage'));
    return;
  }

  try {
    const openpayConfig = getConfig('system.openpay', {});
    let clientId = openpayConfig?.clientId;
    let clientSecret = openpayConfig?.clientSecret;

    if (!clientId || !clientSecret) {
      clientId = await getSetting('openpayClientId', '');
      clientSecret = await getSetting('openpayClientSecret', '');
    }

    if (!clientId || !clientSecret) {
      response.redirect(302, buildUrl('homepage'));
      return;
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

    const { data } = await axios.get(
      `${await getApiBaseUrl()}/api/v2/orders/${order.integration_order_id}`,
      {
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json',
          'Authorization': `Bearer ${access_token}`
        },
        validateStatus: (status) => status < 500
      }
    );

    const isCompleted =
      data?.data?.attributes?.status === 'SUCCESS' &&
      data?.data?.attributes?.payment?.status === 'APPROVED';

    if (!isCompleted) {
      response.redirect(302, buildUrl('homepage'));
      return;
    }

    await update('order')
      .given({ payment_status: 'openpay_captured' })
      .where('uuid', '=', order_id)
      .execute(pool);

    await emit('order_placed', order);
    response.redirect(302, `${buildUrl('checkoutSuccess')}/${order_id}`);
  } catch (error) {
    next(error);
  }
};
