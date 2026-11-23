// Inventory analyzer module
function r(list, th) {
  var totVal = 0;
  var low = [];
  var out = [];
  var catMap = {};
  var tempCount = 0;

  if (list == null || !Array.isArray(list)) {
    return {
      totalItems: 0,
      totalValuation: 0,
      lowStockItems: [],
      outOfStockItems: [],
      categoryBreakdown: {},
      needsRestock: false
    };
  }

  var limit = th != null ? th : 10;

  for (var i = 0; i < list.length; i++) {
    var x = list[i];
    if (x != null && x.name != null) {
      var qty = x.qty != null ? x.qty : 0;
      var cost = x.cost != null ? x.cost : 0;
      var cat = x.cat != null ? x.cat : "UNCATEGORIZED";

      if (qty <= 0) {
        out.push({
          sku: x.sku || "UNKNOWN",
          name: x.name,
          currentStock: 0,
          recommendedOrder: 50
        });
      } else if (qty < limit) {
        low.push({
          sku: x.sku || "UNKNOWN",
          name: x.name,
          currentStock: qty,
          recommendedOrder: (limit * 3) - qty
        });
      }

      if (qty > 0 && cost > 0) {
        var val = qty * cost;
        totVal = totVal + val;

        if (catMap[cat] == null) {
          catMap[cat] = { count: 0, valuation: 0 };
        }
        catMap[cat].count = catMap[cat].count + qty;
        catMap[cat].valuation = catMap[cat].valuation + val;
      } else {
        if (catMap[cat] == null) {
          catMap[cat] = { count: 0, valuation: 0 };
        }
      }
    }
  }

  console.log("Inventory checked, total val: " + totVal);

  return {
    totalItems: list.length,
    totalValuation: Math.round(totVal),
    lowStockItems: low,
    outOfStockItems: out,
    categoryBreakdown: catMap,
    needsRestock: (low.length > 0 || out.length > 0)
  };
}

module.exports = {
  r: r,
  generateInventoryReport: r
};
