import { getConfig } from '../../../../../lib/util/getConfig.js';

function getSettingValue(setting, name, fallback = null) {
  const item = setting.find((s) => s.name === name);
  return item ? item.value : fallback;
}

export default {
  Setting: {
    mercadopagoPaymentStatus: (setting) => {
      const mercadoPagoConfig = getConfig('system.mercadopago', {});
      const configuredStatus = Number(mercadoPagoConfig?.status);
      if (configuredStatus === 1) {
        return configuredStatus;
      }
      return parseInt(
        getSettingValue(setting, 'mercadopagoPaymentStatus', 0),
        10
      );
    },
    mercadopagoDisplayName: (setting) =>
      getSettingValue(setting, 'mercadopagoDisplayName', 'Mercado Pago'),
    mercadopagoAccessToken: (setting, _, { user }) => {
      const mercadoPagoConfig = getConfig('system.mercadopago', {});
      if (mercadoPagoConfig?.accessToken) {
        return '*******************************';
      }
      if (!user) {
        return null;
      }
      return getSettingValue(setting, 'mercadopagoAccessToken', '');
    },
    mercadopagoPublicKey: (setting) => {
      const mercadoPagoConfig = getConfig('system.mercadopago', {});
      if (mercadoPagoConfig?.publicKey) {
        return mercadoPagoConfig.publicKey;
      }
      return getSettingValue(setting, 'mercadopagoPublicKey', '');
    },
    mercadopagoSandboxMode: (setting) => {
      const mercadoPagoConfig = getConfig('system.mercadopago', {});
      if (mercadoPagoConfig?.sandboxMode !== undefined) {
        return Number(mercadoPagoConfig.sandboxMode);
      }
      return parseInt(getSettingValue(setting, 'mercadopagoSandboxMode', 1), 10);
    }
  }
};
