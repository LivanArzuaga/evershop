import { InputField } from '@components/common/form/InputField.js';
import { ToggleField } from '@components/common/form/ToggleField.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/common/ui/Card.js';
import React from 'react';

interface MercadoPagoSettingProps {
  setting: {
    mercadopagoPaymentStatus: true | false | 0 | 1;
    mercadopagoDisplayName: string;
    mercadopagoAccessToken: string;
    mercadopagoPublicKey: string;
    mercadopagoSandboxMode: true | false | 0 | 1;
  };
}

export default function MercadoPagoSetting({
  setting: {
    mercadopagoPaymentStatus,
    mercadopagoDisplayName,
    mercadopagoAccessToken,
    mercadopagoPublicKey,
    mercadopagoSandboxMode
  }
}: MercadoPagoSettingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mercado Pago</CardTitle>
        <CardDescription>
          Configure Mercado Pago Checkout Pro credentials and behavior
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>Enable?</h4>
          </div>
          <div className="col-span-2">
            <ToggleField
              name="mercadopagoPaymentStatus"
              defaultValue={mercadopagoPaymentStatus}
              trueValue={1}
              falseValue={0}
            />
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>Display Name</h4>
          </div>
          <div className="col-span-2">
            <InputField
              name="mercadopagoDisplayName"
              placeholder="Display Name"
              defaultValue={mercadopagoDisplayName || ''}
            />
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>Access Token</h4>
          </div>
          <div className="col-span-2">
            <InputField
              name="mercadopagoAccessToken"
              type="password"
              placeholder="APP_USR-..."
              defaultValue={mercadopagoAccessToken || ''}
              helperText="Required to create Checkout Pro payment preferences from the backend."
            />
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>Public Key</h4>
          </div>
          <div className="col-span-2">
            <InputField
              name="mercadopagoPublicKey"
              placeholder="APP_USR-..."
              defaultValue={mercadopagoPublicKey || ''}
              helperText="Optional for this redirect integration, but useful to keep together with the account settings."
            />
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>Sandbox mode</h4>
          </div>
          <div className="col-span-2">
            <ToggleField
              name="mercadopagoSandboxMode"
              defaultValue={mercadopagoSandboxMode}
              trueValue={1}
              falseValue={0}
              trueLabel="Sandbox"
              falseLabel="Production"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const layout = {
  areaId: 'paymentSetting',
  sortOrder: 25
};

export const query = `
  query Query {
    setting {
      mercadopagoPaymentStatus
      mercadopagoDisplayName
      mercadopagoAccessToken
      mercadopagoPublicKey
      mercadopagoSandboxMode
    }
  }
`;
