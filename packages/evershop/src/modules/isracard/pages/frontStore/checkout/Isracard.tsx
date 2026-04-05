import { Button } from '@components/common/ui/Button.js';
import {
  useCheckout,
  useCheckoutDispatch
} from '@components/frontStore/checkout/CheckoutContext.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

interface IsracardMethodProps {
  createOrderAPI: string;
  setting: {
    isracardDisplayName: string;
  };
}

export default function IsracardMethod({
  createOrderAPI,
  setting: { isracardDisplayName }
}: IsracardMethodProps) {
  const {
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
            data.error?.message ||
              _('Unable to connect to Isracard. Please try again.')
          );
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } catch (error) {
        toast.error(
          (error as Error)?.message ||
            _('Unable to connect to Isracard. Please try again.')
        );
      }
    };

    if (orderPlaced && orderId && paymentMethod === 'isracard') {
      createOrder();
    }
  }, [createOrderAPI, orderId, orderPlaced, paymentMethod]);

  useEffect(() => {
    registerPaymentComponent('isracard', {
      nameRenderer: () => <span>{isracardDisplayName}</span>,
      formRenderer: () => (
        <div className="flex justify-center text-muted-foreground">
          <div className="w-2/3 text-center py-3">
            {_('You will be redirected to Isracard for payment processing.')}
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
              (error as Error)?.message ||
                _('Failed to place order. Please try again.')
            );
          }
        };

        const isDisabled = loadingStates.placingOrder || orderPlaced;

        return (
          <Button
            variant="default"
            size="xl"
            type="button"
            onClick={handleClick}
            disabled={isDisabled}
            className="w-full text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDisabled ? '#888888' : '#1f5eff'
            }}
            onMouseEnter={(e) => {
              if (!isDisabled) {
                e.currentTarget.style.backgroundColor = '#123fb5';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDisabled) {
                e.currentTarget.style.backgroundColor = '#1f5eff';
              }
            }}
          >
            <span className="flex items-center justify-center space-x-2">
              {loadingStates.placingOrder || orderPlaced ? (
                <span>{_('Redirecting to Isracard...')}</span>
              ) : (
                <span>{_('Pay with Isracard')}</span>
              )}
            </span>
          </Button>
        );
      }
    });
  }, [registerPaymentComponent, isracardDisplayName]);

  return null;
}

export const layout = {
  areaId: 'checkoutFormAfter',
  sortOrder: 25
};

export const query = `
  query Query {
    setting {
      isracardDisplayName
    }
    createOrderAPI: url(routeId: "isracardCreateOrder")
  }
`;
