const TAX_RATE = 0.11;
const ADMIN_FEE = 2500;
const SHIPPING_RATE_PER_KG = 8000;
const DEFAULT_ITEM_SHIPPING = 10000;
const MAX_DISCOUNT_RATIO = 0.5;

/**
 * Menghitung subtotal harga dan total ongkos kirim dari daftar item pesanan.
 * @param {Array<{q: number, pr: number, w?: number}>} items - Daftar item dalam pesanan
 * @returns {{subtotal: number, shippingCost: number}} Subtotal dan ongkos kirim
 */
function calculateItemsSubtotalAndShipping(items) {
  let subtotal = 0;
  let shippingCost = 0;

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (item.q > 0 && item.pr > 0) {
      subtotal += item.q * item.pr;
      if (item.w !== undefined && item.w !== null && item.w > 0) {
        shippingCost += item.w * item.q * SHIPPING_RATE_PER_KG;
      } else {
        shippingCost += item.q * DEFAULT_ITEM_SHIPPING;
      }
    }
  }

  return { subtotal, shippingCost };
}

/**
 * Menghitung diskon berdasarkan tipe keanggotaan pelanggan (tier).
 * @param {number} subtotal - Subtotal harga pesanan
 * @param {{t?: string}|null} customer - Objek data pelanggan
 * @returns {number} Nilai diskon tier pelanggan
 */
function calculateTierDiscount(subtotal, customer) {
  if (!customer || !customer.t) {
    return 0;
  }

  if (customer.t === 'VIP') {
    return subtotal > 1000000 ? subtotal * 0.2 : subtotal * 0.12;
  }
  if (customer.t === 'GOLD') {
    return subtotal > 500000 ? subtotal * 0.1 : subtotal * 0.05;
  }
  if (customer.t === 'REGULAR') {
    return subtotal > 500000 ? subtotal * 0.03 : 0;
  }

  return 0;
}

/**
 * Menerapkan kode kupon promosi pada diskon dan ongkos kirim.
 * @param {number} subtotal - Subtotal pesanan
 * @param {number} currentDiscount - Diskon awal sebelum kupon
 * @param {number} currentShipping - Ongkos kirim awal
 * @param {string|null} couponCode - Kode kupon promosi
 * @returns {{discountAmount: number, shippingCost: number}} Diskon dan ongkir setelah kupon
 */
function applyCouponAdjustments(
  subtotal,
  currentDiscount,
  currentShipping,
  couponCode
) {
  let discountAmount = currentDiscount;
  let shippingCost = currentShipping;

  if (couponCode) {
    if (couponCode === 'HEMAT50' && subtotal >= 300000) {
      discountAmount += 50000;
    } else if (couponCode === 'ONGKIRFREE') {
      shippingCost = 0;
    } else if (couponCode === 'DISKON10') {
      discountAmount += subtotal * 0.1;
    }
  }

  const maxAllowedDiscount = subtotal * MAX_DISCOUNT_RATIO;
  if (discountAmount > maxAllowedDiscount) {
    discountAmount = maxAllowedDiscount;
  }

  return { discountAmount, shippingCost };
}

/**
 * Memproses checkout pesanan pelanggan beserta kalkulasi diskon, pajak, dan ongkos kirim.
 * @param {{items?: Array<{q: number, pr: number, w?: number}>}|null} orderData - Data pesanan
 * @param {{t?: string}|null} customer - Data pelanggan
 * @param {string|null} couponCode - Kode kupon diskon
 * @returns {{
 *   subtotal: number,
 *   discount: number,
 *   tax: number,
 *   shipping: number,
 *   adminFee: number,
 *   finalTotal: number,
 *   status: string
 * }} Hasil kalkulasi checkout pesanan
 */
function processOrderCheckout(orderData, customer, couponCode) {
  if (!orderData) {
    return {
      subtotal: 0,
      discount: 0,
      tax: 0,
      shipping: 0,
      adminFee: 0,
      finalTotal: 0,
      status: 'INVALID_ORDER',
    };
  }

  if (!orderData.items || orderData.items.length === 0) {
    return {
      subtotal: 0,
      discount: 0,
      tax: 0,
      shipping: 0,
      adminFee: 0,
      finalTotal: 0,
      status: 'EMPTY_ITEMS',
    };
  }

  const { subtotal, shippingCost: initialShipping } =
    calculateItemsSubtotalAndShipping(orderData.items);
  const tierDiscount = calculateTierDiscount(subtotal, customer);
  const { discountAmount, shippingCost } = applyCouponAdjustments(
    subtotal,
    tierDiscount,
    initialShipping,
    couponCode
  );

  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * TAX_RATE;
  const grandTotal = taxableAmount + taxAmount + shippingCost + ADMIN_FEE;

  return {
    subtotal: Math.round(subtotal),
    discount: Math.round(discountAmount),
    tax: Math.round(taxAmount),
    shipping: Math.round(shippingCost),
    adminFee: ADMIN_FEE,
    finalTotal: Math.round(grandTotal),
    status: 'SUCCESS',
  };
}

module.exports = {
  processOrderCheckout,
};
