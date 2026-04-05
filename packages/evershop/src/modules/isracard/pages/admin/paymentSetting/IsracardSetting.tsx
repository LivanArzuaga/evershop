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

interface IsracardSettingProps {
  setting: {
    isracardPaymentStatus: true | false | 0 | 1;
    isracardDisplayName: string;
    isracardApiBaseUrl: string;
    isracardMerchantId: string;
    isracardTerminalId: string;
    isracardApiUsername: string;
    isracardApiPassword: string;
    isracardApiKey: string;
  };
}

export default function IsracardSetting({
  setting: {
    isracardPaymentStatus,
    isracardDisplayName,
    isracardApiBaseUrl,
    isracardMerchantId,
    isracardTerminalId,
    isracardApiUsername,
    isracardApiPassword,
    isracardApiKey
  }
}: IsracardSettingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Isracard Payment</CardTitle>
        <CardDescription>
          Configure your Isracard payment gateway settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>Enable?</h4>
          </div>
          <div className="col-span-2">
            <ToggleField
              name="isracardPaymentStatus"
              defaultValue={isracardPaymentStatus}
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
              name="isracardDisplayName"
              placeholder="Display Name"
              defaultValue={isracardDisplayName || ''}
            />
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>API Base URL</h4>
          </div>
          <div className="col-span-2">
            <InputField
              name="isracardApiBaseUrl"
              placeholder="https://..."
              defaultValue={isracardApiBaseUrl || ''}
              helperText="Base URL for the Isracard payments API exposed to your merchant account."
            />
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>Merchant ID</h4>
          </div>
          <div className="col-span-2">
            <InputField
              name="isracardMerchantId"
              placeholder="Merchant ID"
              defaultValue={isracardMerchantId || ''}
            />
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>Terminal ID</h4>
          </div>
          <div className="col-span-2">
            <InputField
              name="isracardTerminalId"
              placeholder="Terminal ID"
              defaultValue={isracardTerminalId || ''}
            />
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>API Username</h4>
          </div>
          <div className="col-span-2">
            <InputField
              name="isracardApiUsername"
              placeholder="API Username"
              defaultValue={isracardApiUsername || ''}
            />
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>API Password</h4>
          </div>
          <div className="col-span-2">
            <InputField
              name="isracardApiPassword"
              type="password"
              placeholder="API Password"
              defaultValue={isracardApiPassword || ''}
            />
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>API Key</h4>
          </div>
          <div className="col-span-2">
            <InputField
              name="isracardApiKey"
              type="password"
              placeholder="Optional API Key"
              defaultValue={isracardApiKey || ''}
              helperText="Optional bearer token if your Isracard account uses token-based auth."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const layout = {
  areaId: 'paymentSetting',
  sortOrder: 20
};

export const query = `
  query Query {
    setting {
      isracardPaymentStatus
      isracardDisplayName
      isracardApiBaseUrl
      isracardMerchantId
      isracardTerminalId
      isracardApiUsername
      isracardApiPassword
      isracardApiKey
    }
  }
`;
