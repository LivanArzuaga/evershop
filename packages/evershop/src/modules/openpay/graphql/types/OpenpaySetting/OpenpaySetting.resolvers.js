import { getConfig } from '../../../../../lib/util/getConfig.js';
import { getSetting } from '../../../../setting/services/setting.js';

export default {
  Setting: {
    openpayDisplayName: (setting) => {
      const openpayDisplayName = setting.find(
        (s) => s.name === 'openpayDisplayName'
      );
      if (openpayDisplayName) {
        return openpayDisplayName.value;
      }
      return 'Openpay';
    },
    openpayEnvironment: (setting) => {
      const openpayConfig = getConfig('system.openpay', {});
      if (openpayConfig?.environment) {
        return openpayConfig.environment;
      }
      const openpayEnvironment = setting.find(
        (s) => s.name === 'openpayEnvironment'
      );
      if (openpayEnvironment) {
        return openpayEnvironment.value;
      }
      return 'https://api-mpos-openpay-ar.stg.geopagos.io';
    },
    openpayClientId: (setting) => {
      const openpayConfig = getConfig('system.openpay', {});
      if (openpayConfig?.clientId) {
        return openpayConfig.clientId;
      }
      const openpayClientId = setting.find(
        (s) => s.name === 'openpayClientId'
      );
      if (openpayClientId) {
        return openpayClientId.value;
      }
      return null;
    },
    openpayClientSecret: (setting, _, { user }) => {
      const openpayConfig = getConfig('system.openpay', {});
      if (openpayConfig?.clientSecret) {
        return '*******************************';
      }
      if (!user) {
        return null;
      }
      const openpayClientSecret = setting.find(
        (s) => s.name === 'openpayClientSecret'
      );
      if (openpayClientSecret) {
        return openpayClientSecret.value;
      }
      return null;
    }
  }
};
