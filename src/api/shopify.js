import { getOrderTotals, shopProduct } from '../data/shopProduct';

/**
 * Shopify Storefront / Checkout stubs.
 * Replace these with real Admin/Storefront API calls when the shop is connected.
 */

let nextOrderNumber = 1001;

/**
 * Create a checkout draft for the physical CD.
 * @returns {Promise<{ checkoutId: string, totals: object, product: object }>}
 */
export async function createCheckout({ quantity = 1 } = {}) {
  const totals = getOrderTotals(quantity);
  return {
    checkoutId: `stub-checkout-${Date.now()}`,
    product: shopProduct,
    totals,
  };
}

/**
 * Complete checkout / create order.
 * Hook up Shopify Storefront checkoutComplete or Cart → Checkout here.
 * @returns {Promise<{ orderNumber: string, orderName: string, totals: object, customer: object }>}
 */
export async function completeCheckout({
  quantity = 1,
  email = '',
  shippingAddress = {},
  shippingMethod = 'standard',
  paymentMethod = 'credit_card',
} = {}) {
  const totals = getOrderTotals(quantity);
  const orderNumber = String(nextOrderNumber);
  nextOrderNumber += 1;

  // Simulate network latency for the Win98 shop feel.
  await new Promise((resolve) => {
    setTimeout(resolve, 280);
  });

  return {
    orderNumber,
    orderName: `#${orderNumber}`,
    totals,
    customer: {
      email,
      shippingAddress,
      shippingMethod,
      paymentMethod,
    },
    // Real Shopify fields would include: id, webUrl, orderStatusUrl, etc.
    shopify: {
      connected: false,
      note: 'Stub response — connect Storefront API credentials to go live.',
    },
  };
}
