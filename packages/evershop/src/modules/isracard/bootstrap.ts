import config from 'config';
import { getConfig } from '../../lib/util/getConfig.js';
import { registerPaymentMethod } from '../checkout/services/getAvailablePaymentMethods.js';
import { getSetting } from '../setting/services/setting.js';

export default async () => {
  const isracardPaymentStatus = {
    order: {
      paymentStatus: {
        isracard_captured: {
          name: 'Captured',
          badge: 'success',
          isDefault: false,
          isCancelable: false
        },
        isracard_failed: {
          name: 'Failed',
          badge: 'critical',
          isDefault: false,
          isCancelable: true
        }
      },
      psoMapping: {
        'isracard_captured:*': 'processing',
        'isracard_captured:delivered': 'completed',
        'isracard_failed:*': 'new'
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

  config.util.setModuleDefaults('oms', isracardPaymentStatus);

  registerPaymentMethod({
    init: async () => ({
      code: 'isracard',
      name: await getSetting('isracardDisplayName', 'Isracard')
    }),
    validator: async () => {
      const isracardConfig = getConfig('system.isracard', {});
      const configuredStatus = Number(isracardConfig?.status);
      const isracardStatus =
        configuredStatus === 1
          ? configuredStatus
          : await getSetting('isracardPaymentStatus', 0);

      return Number(isracardStatus) === 1;
    }
  });
};
