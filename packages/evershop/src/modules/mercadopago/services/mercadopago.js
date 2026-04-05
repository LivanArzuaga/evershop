import { getConfig } from '../../../lib/util/getConfig.js';
import { getSetting } from '../../setting/services/setting.js';

export async function getMercadoPagoConfig() {
  const mercadoPagoConfig = getConfig('system.mercadopago', {});

  return {
    accessToken:
      mercadoPagoConfig?.accessToken ||
      (await getSetting('mercadopagoAccessToken', '')),
    publicKey:
      mercadoPagoConfig?.publicKey ||
      (await getSetting('mercadopagoPublicKey', '')),
    sandboxMode:
      mercadoPagoConfig?.sandboxMode !== undefined
        ? Number(mercadoPagoConfig.sandboxMode)
        : Number(await getSetting('mercadopagoSandboxMode', 1))
  };
}

export function getMercadoPagoHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
}

export function normalizeMercadoPagoStatus(status) {
  return `${status || ''}`.toLowerCase();
}
