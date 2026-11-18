/** Physical CD product — wired to Shopify later via src/api/shopify.js */

export const shopProduct = {
  id: 'ctrl-alt-del-physical-cd',
  title: 'CTRL-ALT-DEL',
  artist: 'lëssen',
  type: 'Physical CD',
  priceEuros: 15,
  shippingEuros: 4,
  shippingLabel: 'NL shipping €4.00',
  shippingMethodLabel: 'Standard',
  currency: 'EUR',
  cover: '/RESOURCES/ep_cover.jpg',
  icon: '/RESOURCES/cd_rom_icon.png',
  maxQuantity: 10,
};

export function formatEuros(amount) {
  return `€${Number(amount).toFixed(2)}`;
}

export function getOrderTotals(quantity = 1) {
  const qty = Math.max(1, Math.min(shopProduct.maxQuantity, Number(quantity) || 1));
  const subtotal = shopProduct.priceEuros * qty;
  const shipping = shopProduct.shippingEuros;
  return {
    quantity: qty,
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
}
