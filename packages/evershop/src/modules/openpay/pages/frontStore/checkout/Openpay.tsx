import { Button } from '@components/common/ui/Button.js';
import { useCheckout, useCheckoutDispatch } from '@components/frontStore/checkout/CheckoutContext.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

interface OpenpayMethodProps {
  createOrderAPI: string;
  setting: {
    openpayDisplayName: string;
  };
}

export default function OpenpayMethod({
  createOrderAPI,
  setting: { openpayDisplayName }
}: OpenpayMethodProps) {
  const {
    checkoutSuccessUrl,
    orderPlaced,
    orderId,
    checkoutData: { paymentMethod }
  } = useCheckout();
  const { registerPaymentComponent } = useCheckoutDispatch();

  useEffect(() => {
    const createOrder = async () => {
      try {
        const response = await fetch(createOrderAPI, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ order_id: orderId })
        });
        const data = await response.json();
        if (!data.error && data.data?.approveUrl) {
          window.location.href = data.data.approveUrl;
        } else {
          toast.error(
            (data.error as any)?.message || _('Unable to connect to Openpay. Please try again.')
          );
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } catch (error) {
        toast.error(
          (error as Error)?.message || _('Unable to connect to Openpay. Please try again.')
        );
      }
    };

    if (orderPlaced && orderId && paymentMethod === 'openpay') {
      createOrder();
    }
  }, [createOrderAPI, orderId, orderPlaced, paymentMethod]);

  useEffect(() => {
    registerPaymentComponent('openpay', {
      nameRenderer: () => <span>{openpayDisplayName}</span>,
      formRenderer: () => (
        <div className="flex justify-center text-muted-foreground">
          <div className="w-2/3 text-center py-3">
            {_('You will be redirected to Openpay for payment processing.')}
          </div>
        </div>
      ),
      checkoutButtonRenderer: () => {
        const { checkout } = useCheckoutDispatch();
        const { loadingStates, orderPlaced } = useCheckout();
        const handleClick = async (e: React.MouseEvent) => {
          try {
            e.preventDefault();
            await checkout();
          } catch (error) {
            toast.error(
              (error as Error)?.message || _('Failed to place order. Please try again.')
            );
          }
        };

        const isDisabled = loadingStates.placingOrder || orderPlaced;

        return (
          <Button
            variant={'default'}
            size={'xl'}
            type="button"
            onClick={handleClick}
            disabled={isDisabled}
            className="w-full text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDisabled ? '#888888' : '#0057d9'
            }}
            onMouseEnter={(e) => {
              if (!isDisabled) {
                e.currentTarget.style.backgroundColor = '#003e9a';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDisabled) {
                e.currentTarget.style.backgroundColor = '#0057d9';
              }
            }}
          >
            <span className="flex items-center justify-center space-x-2">
              {loadingStates.placingOrder ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="24"
                    height="24"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#ffffff"
                      d="M24 4a20 20 0 1 0 20 20A20.023 20.023 0 0 0 24 4zm0 36a16 16 0 1 1 16-16 16.018 16.018 0 0 1-16 16z"
                    ></path>
                  </svg>
                  <span>{_('Redirecting to Openpay...')}</span>
                </>
              ) : orderPlaced ? (
                <span>{_('Redirecting to Openpay...')}</span>
              ) : (
                <span>{_('Pay with Openpay')}</span>
              )}
            </span>
          </Button>
        );
      }
    });
  }, [registerPaymentComponent, openpayDisplayName]);

  return null;
}

export const layout = {
  areaId: 'checkoutFormAfter',
  sortOrder: 20
};

export const query = `
  query Query {
    setting {
      openpayDisplayName
    }
    createOrderAPI: url(routeId: "openpayCreateOrder")
  }
`;
