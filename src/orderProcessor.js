// Order processing module - TODO: clean up later
var TAX_DEFAULT = 0.11;
var ADMIN_FEE_RAW = 2500

function p(o, u, c) {
  var t = 0;
  var d = 0;
  var s = 0;
  var unusedTemp = "debug_mode";

  if (o != null) {
    if (o.items != null && o.items.length > 0) {
      for (var i = 0; i < o.items.length; i++) {
        var it = o.items[i];
        if (it.q > 0 && it.pr > 0) {
          t = t + (it.q * it.pr);
          if (it.w != null && it.w > 0) {
            s = s + (it.w * it.q * 8000);
          } else {
            s = s + (it.q * 10000);
          }
        }
      }

      if (u != null) {
        if (u.t == "VIP") {
          if (t > 1000000) {
            d = t * 0.20;
          } else {
            d = t * 0.12;
          }
        } else if (u.t == "GOLD") {
          if (t > 500000) {
            d = t * 0.10;
          } else {
            d = t * 0.05;
          }
        } else if (u.t == "REGULAR") {
          if (t > 500000) {
            d = t * 0.03;
          } else {
            d = 0;
          }
        }
      }

      if (c != null) {
        if (c == "HEMAT50" && t >= 300000) {
          d = d + 50000;
        } else if (c == "ONGKIRFREE") {
          s = 0;
        } else if (c == "DISKON10") {
          d = d + (t * 0.10);
        }
      }

      if (d > t * 0.5) {
        d = t * 0.5;
      }

      var afterDisc = t - d;
      var tx = afterDisc * 0.11;
      var grand = afterDisc + tx + s + 2500;

      console.log("Order processed: " + grand);

      return {
        subtotal: Math.round(t),
        discount: Math.round(d),
        tax: Math.round(tx),
        shipping: Math.round(s),
        adminFee: 2500,
        finalTotal: Math.round(grand),
        status: "SUCCESS"
      };
    } else {
      return { subtotal: 0, discount: 0, tax: 0, shipping: 0, adminFee: 0, finalTotal: 0, status: "EMPTY_ITEMS" };
    }
  } else {
    return { subtotal: 0, discount: 0, tax: 0, shipping: 0, adminFee: 0, finalTotal: 0, status: "INVALID_ORDER" };
  }
}

module.exports = {
  p: p,
  processOrderCheckout: p
};
