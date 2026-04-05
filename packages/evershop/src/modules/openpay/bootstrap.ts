import config from 'config';
import { getConfig } from '../../lib/util/getConfig.js';
import { registerPaymentMethod } from '../checkout/services/getAvailablePaymentMethods.js';
import { getSetting } from '../setting/services/setting.js';

export default async () => {
  const openpayPaymentStatus = {
    order: {
      paymentStatus: {
        openpay_captured: {
          name: 'Captured',
          badge: 'success',
          isDefault: false,
          isCancelable: false
        },
        openpay_failed: {
          name: 'Failed',
          badge: 'critical',
          isDefault: false,
          isCancelable: true
        }
      },
      psoMapping: {
        'openpay_captured:*': 'processing',
        'openpay_captured:delivered': 'completed',
        'openpay_failed:*': 'new'
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

  config.util.setModuleDefaults('oms', openpayPaymentStatus);

  registerPaymentMethod({
    init: async () => ({
      code: 'openpay',
      name: await getSetting('openpayDisplayName', 'Openpay')
    }),
    validator: async () => {
      const openpayConfig = getConfig('system.openpay', {});
      let openpayStatus;
      if (openpayConfig?.status !== undefined) {
        openpayStatus = openpayConfig.status;
      } else {
        openpayStatus = await getSetting('openpayPaymentStatus', 0);
      }
      return Number(openpayStatus) === 1;
    }
  });
};
