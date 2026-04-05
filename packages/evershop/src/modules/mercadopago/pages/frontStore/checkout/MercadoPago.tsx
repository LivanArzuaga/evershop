import { Button } from '@components/common/ui/Button.js';
import {
  useCheckout,
  useCheckoutDispatch
} from '@components/frontStore/checkout/CheckoutContext.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

interface MercadoPagoMethodProps {
  createOrderAPI: string;
  setting: {
    mercadopagoDisplayName: string;
  };
}

export default function MercadoPagoMethod({
  createOrderAPI,
  setting: { mercadopagoDisplayName }
}: MercadoPagoMethodProps) {
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
              _('Unable to connect to Mercado Pago. Please try again.')
          );
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } catch (error) {
        toast.error(
          (error as Error)?.message ||
            _('Unable to connect to Mercado Pago. Please try again.')
        );
      }
    };

    if (orderPlaced && orderId && paymentMethod === 'mercadopago') {
      createOrder();
    }
  }, [createOrderAPI, orderId, orderPlaced, paymentMethod]);

  useEffect(() => {
    registerPaymentComponent('mercadopago', {
      nameRenderer: () => <span>{mercadopagoDisplayName}</span>,
      formRenderer: () => (
        <div className="flex justify-center text-muted-foreground">
          <div className="w-2/3 text-center py-3">
            {_(
              'You will be redirected to Mercado Pago to complete the payment.'
            )}
          </div>
        </div>
      ),
      checkoutButtonRenderer: () => {
        const { checkout } = useCheckoutDispatch();
        const { loadingStates, orderPlaced } = useCheckout();
        const isDisabled = loadingStates.placingOrder || orderPlaced;

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

        return (
          <Button
            variant="default"
            size="xl"
            type="button"
            onClick={handleClick}
            disabled={isDisabled}
            className="w-full text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDisabled ? '#888888' : '#009ee3'
            }}
            onMouseEnter={(e) => {
              if (!isDisabled) {
                e.currentTarget.style.backgroundColor = '#007eb5';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDisabled) {
                e.currentTarget.style.backgroundColor = '#009ee3';
              }
            }}
          >
            <span className="flex items-center justify-center space-x-2">
              {loadingStates.placingOrder || orderPlaced ? (
                <span>{_('Redirecting to Mercado Pago...')}</span>
              ) : (
                <span>{_('Pay with Mercado Pago')}</span>
              )}
            </span>
          </Button>
        );
      }
    });
  }, [registerPaymentComponent, mercadopagoDisplayName]);

  return null;
}

export const layout = {
  areaId: 'checkoutFormAfter',
  sortOrder: 30
};

export const query = `
  query Query {
    setting {
      mercadopagoDisplayName
    }
    createOrderAPI: url(routeId: "mercadopagoCreateOrder")
  }
`;
