import { getConfig } from '../../../../../lib/util/getConfig.js';

function getSettingValue(setting, name, fallback = null) {
  const item = setting.find((s) => s.name === name);
  return item ? item.value : fallback;
}

export default {
  Setting: {
    isracardPaymentStatus: (setting) => {
      const isracardConfig = getConfig('system.isracard', {});
      const configuredStatus = Number(isracardConfig?.status);
      if (configuredStatus === 1) {
        return configuredStatus;
      }
      return parseInt(getSettingValue(setting, 'isracardPaymentStatus', 0), 10);
    },
    isracardDisplayName: (setting) =>
      getSettingValue(setting, 'isracardDisplayName', 'Isracard'),
    isracardApiBaseUrl: (setting) => {
      const isracardConfig = getConfig('system.isracard', {});
      if (isracardConfig?.apiBaseUrl) {
        return isracardConfig.apiBaseUrl;
      }
      return getSettingValue(setting, 'isracardApiBaseUrl', '');
    },
    isracardMerchantId: (setting) => {
      const isracardConfig = getConfig('system.isracard', {});
      if (isracardConfig?.merchantId) {
        return isracardConfig.merchantId;
      }
      return getSettingValue(setting, 'isracardMerchantId', '');
    },
    isracardTerminalId: (setting) => {
      const isracardConfig = getConfig('system.isracard', {});
      if (isracardConfig?.terminalId) {
        return isracardConfig.terminalId;
      }
      return getSettingValue(setting, 'isracardTerminalId', '');
    },
    isracardApiUsername: (setting, _, { user }) => {
      const isracardConfig = getConfig('system.isracard', {});
      if (isracardConfig?.apiUsername) {
        return '*******************************';
      }
      if (!user) {
        return null;
      }
      return getSettingValue(setting, 'isracardApiUsername', '');
    },
    isracardApiPassword: (setting, _, { user }) => {
      const isracardConfig = getConfig('system.isracard', {});
      if (isracardConfig?.apiPassword) {
        return '*******************************';
      }
      if (!user) {
        return null;
      }
      return getSettingValue(setting, 'isracardApiPassword', '');
    },
    isracardApiKey: (setting, _, { user }) => {
      const isracardConfig = getConfig('system.isracard', {});
      if (isracardConfig?.apiKey) {
        return '*******************************';
      }
      if (!user) {
        return null;
      }
      return getSettingValue(setting, 'isracardApiKey', '');
    }
  }
};
