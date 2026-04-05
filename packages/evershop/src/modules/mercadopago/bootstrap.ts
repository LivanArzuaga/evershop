import config from 'config';
import { getConfig } from '../../lib/util/getConfig.js';
import { registerPaymentMethod } from '../checkout/services/getAvailablePaymentMethods.js';
import { getSetting } from '../setting/services/setting.js';

export default async () => {
  const mercadoPagoPaymentStatus = {
    order: {
      paymentStatus: {
        mercadopago_captured: {
          name: 'Captured',
          badge: 'success',
          isDefault: false,
          isCancelable: false
        },
        mercadopago_pending: {
          name: 'Pending',
          badge: 'attention',
          isDefault: false,
          isCancelable: false
        },
        mercadopago_failed: {
          name: 'Failed',
          badge: 'critical',
          isDefault: false,
          isCancelable: true
        }
      },
      psoMapping: {
        'mercadopago_captured:*': 'processing',
        'mercadopago_captured:delivered': 'completed',
        'mercadopago_pending:*': 'new',
        'mercadopago_failed:*': 'new'
      }
    }
  } as {
    order: {
      paymentStatus: {
        [key: string]: {
          name: string;
          badge: string;
          isDefault?: boolean;
          isCancelable?: boolean;
        };
      };
      psoMapping: {
        [key: string]: string;
      };
    };
  };

  config.util.setModuleDefaults('oms', mercadoPagoPaymentStatus);

  registerPaymentMethod({
    init: async () => ({
      code: 'mercadopago',
      name: await getSetting('mercadopagoDisplayName', 'Mercado Pago')
    }),
    validator: async () => {
      const mercadoPagoConfig = getConfig('system.mercadopago', {});
      const configuredStatus = Number(mercadoPagoConfig?.status);
      const mercadopagoStatus =
        configuredStatus === 1
          ? configuredStatus
          : await getSetting('mercadopagoPaymentStatus', 0);
      return Number(mercadopagoStatus) === 1;
    }
  });
};
