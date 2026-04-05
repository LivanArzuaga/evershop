import { getConfig } from '../../../lib/util/getConfig.js';
import { getSetting } from '../../setting/services/setting.js';

export async function getApiBaseUrl() {
  const openpayConfig = getConfig('system.openpay', {});
  if (openpayConfig?.environment) {
    return openpayConfig.environment;
  }
  return await getSetting('openpayEnvironment', 'https://api-mpos-openpay-ar.stg.geopagos.io');
}

export async function getAuthBaseUrl() {
  const openpayConfig = getConfig('system.openpay', {});
  if (openpayConfig?.authEnvironment) {
    return openpayConfig.authEnvironment;
  }
  const environment = await getSetting('openpayEnvironment', 'https://api-mpos-openpay-ar.stg.geopagos.io');
  // Return auth URL based on checkout environment
  return environment.includes('stg') ? 'https://auth.preprod.geopagos.com' : 'https://auth.geopagos.com';
}
