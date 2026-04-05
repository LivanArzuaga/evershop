import { buildUrl } from '../../../lib/router/buildUrl.js';
import { getConfig } from '../../../lib/util/getConfig.js';
import { getSetting } from '../../setting/services/setting.js';

function normalizeBaseUrl(url) {
  return `${url || ''}`.replace(/\/$/, '');
}

export async function getIsracardConfig() {
  const isracardConfig = getConfig('system.isracard', {});

  return {
    apiBaseUrl:
      isracardConfig?.apiBaseUrl ||
      (await getSetting('isracardApiBaseUrl', '')),
    merchantId:
      isracardConfig?.merchantId || (await getSetting('isracardMerchantId', '')),
    terminalId:
      isracardConfig?.terminalId || (await getSetting('isracardTerminalId', '')),
    apiUsername:
      isracardConfig?.apiUsername ||
      (await getSetting('isracardApiUsername', '')),
    apiPassword:
      isracardConfig?.apiPassword ||
      (await getSetting('isracardApiPassword', '')),
    apiKey: isracardConfig?.apiKey || (await getSetting('isracardApiKey', ''))
  };
}

export function getRequestConfig({ apiKey, apiUsername, apiPassword }) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  } else if (apiUsername && apiPassword) {
    headers.Authorization = `Basic ${Buffer.from(
      `${apiUsername}:${apiPassword}`
    ).toString('base64')}`;
  }

  return { headers };
}

export function buildHostedPaymentPayload(order, homeUrl, config) {
  const returnUrl = `${homeUrl}${buildUrl('isracardReturn', {
    order_id: order.uuid
  })}`;
  const cancelUrl = `${homeUrl}${buildUrl('homepage')}`;

  return {
    amount: Number(order.grand_total),
    currency: order.currency,
    orderId: order.uuid,
    merchantId: config.merchantId || undefined,
    terminalId: config.terminalId || undefined,
    description: `Order ${order.order_number}`,
    customer: {
      email: order.customer_email || undefined,
      fullName: order.customer_full_name || undefined
    },
    returnUrl,
    cancelUrl
  };
}

export function extractApproveUrl(data) {
  return (
    data?.approveUrl ||
    data?.approve_url ||
    data?.redirectUrl ||
    data?.redirect_url ||
    data?.paymentUrl ||
    data?.payment_url ||
    data?.url ||
    data?.links?.approve ||
    data?.links?.checkout ||
    data?.data?.approveUrl ||
    data?.data?.redirectUrl ||
    data?.data?.paymentUrl ||
    data?.data?.url ||
    data?.data?.links?.approve ||
    data?.data?.links?.checkout ||
    null
  );
}

export function extractTransactionId(data) {
  return (
    data?.id ||
    data?.paymentId ||
    data?.payment_id ||
    data?.transactionId ||
    data?.transaction_id ||
    data?.orderId ||
    data?.order_id ||
    data?.data?.id ||
    data?.data?.paymentId ||
    data?.data?.payment_id ||
    data?.data?.transactionId ||
    data?.data?.transaction_id ||
    null
  );
}

export function getPaymentStatus(data) {
  return `${(
    data?.status ||
    data?.paymentStatus ||
    data?.payment_status ||
    data?.transactionStatus ||
    data?.transaction_status ||
    data?.data?.status ||
    data?.data?.paymentStatus ||
    data?.data?.payment_status ||
    data?.data?.transactionStatus ||
    data?.data?.transaction_status ||
    data?.data?.payment?.status ||
    ''
  )}`.toLowerCase();
}

export function isSuccessfulPaymentStatus(data, fallbackStatus = '') {
  const normalizedStatus = (
    getPaymentStatus(data) || `${fallbackStatus || ''}`.toLowerCase()
  ).toLowerCase();

  return [
    'approved',
    'paid',
    'captured',
    'success',
    'succeeded',
    'completed'
  ].includes(normalizedStatus);
}

export function buildPaymentUrl(apiBaseUrl, paymentId = '') {
  return `${normalizeBaseUrl(apiBaseUrl)}/payments/${paymentId}`;
}

export function buildPaymentsCollectionUrl(apiBaseUrl) {
  return `${normalizeBaseUrl(apiBaseUrl)}/payments`;
}
