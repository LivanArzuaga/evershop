import { InputField } from '@components/common/form/InputField.js';
import { RadioGroupField } from '@components/common/form/RadioGroupField.js';
import { ToggleField } from '@components/common/form/ToggleField.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/common/ui/Card.js';
import React from 'react';

interface OpenpaySettingProps {
  setting: {
    openpayPaymentStatus: true | false | 0 | 1;
    openpayDisplayName: string;
    openpayClientId: string;
    openpayClientSecret: string;
    openpayEnvironment: string;
  };
}

export default function OpenpaySetting({
  setting: {
    openpayPaymentStatus,
    openpayDisplayName,
    openpayClientId,
    openpayClientSecret,
    openpayEnvironment
  }
}: OpenpaySettingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Openpay Payment</CardTitle>
        <CardDescription>
          Configure your Openpay payment gateway settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>Enable?</h4>
          </div>
          <div className="col-span-2">
            <ToggleField
              name="openpayPaymentStatus"
              defaultValue={openpayPaymentStatus}
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
              name="openpayDisplayName"
              placeholder="Display Name"
              defaultValue={openpayDisplayName || ''}
            />
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>Client ID</h4>
          </div>
          <div className="col-span-2">
            <InputField
              name="openpayClientId"
              placeholder="Client ID"
              defaultValue={openpayClientId || ''}
            />
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>Client Secret</h4>
          </div>
          <div className="col-span-2">
            <InputField
              name="openpayClientSecret"
              placeholder="Client Secret"
              defaultValue={openpayClientSecret || ''}
            />
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>Environment</h4>
          </div>
          <div className="col-span-2">
            <RadioGroupField
              name="openpayEnvironment"
              defaultValue={openpayEnvironment}
              options={[
                {
                  label: 'Sandbox',
                  value: 'https://api-mpos-openpay-ar.stg.geopagos.io'
                },
                {
                  label: 'Live',
                  value: 'https://api.openpayargentina.com.ar'
                }
              ]}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const layout = {
  areaId: 'paymentSetting',
  sortOrder: 5
};

export const query = `
  query Query {
    setting {
      openpayPaymentStatus
      openpayDisplayName
      openpayClientId
      openpayClientSecret
      openpayEnvironment
    }
  }
`;
