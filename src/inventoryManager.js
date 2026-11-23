const DEFAULT_LOW_STOCK_THRESHOLD = 10;
const DEFAULT_OUT_OF_STOCK_ORDER_QTY = 50;
const RESTOCK_MULTIPLIER = 3;

/**
 * Mengevaluasi status stok satu item dan mengelompokkannya ke daftar stok habis atau menipis.
 * @param {{sku?: string, name: string, qty?: number}} item - Objek barang inventaris
 * @param {number} stockThreshold - Batas minimum stok aman
 * @param {Array<object>} lowStockList - Koleksi barang dengan stok menipis
 * @param {Array<object>} outOfStockList - Koleksi barang dengan stok habis
 */
function classifyStockLevel(item, stockThreshold, lowStockList, outOfStockList) {
  const quantity = item.qty ?? 0;
  const itemSku = item.sku || 'UNKNOWN';

  if (quantity <= 0) {
    outOfStockList.push({
      sku: itemSku,
      name: item.name,
      currentStock: 0,
      recommendedOrder: DEFAULT_OUT_OF_STOCK_ORDER_QTY,
    });
  } else if (quantity < stockThreshold) {
    lowStockList.push({
      sku: itemSku,
      name: item.name,
      currentStock: quantity,
      recommendedOrder: stockThreshold * RESTOCK_MULTIPLIER - quantity,
    });
  }
}

/**
 * Memperbarui rincian valuasi dan jumlah barang per kategori di dalam peta kategori.
 * @param {Object.<string, {count: number, valuation: number}>} categoryBreakdown - Peta kategori
 * @param {string} categoryName - Nama kategori barang
 * @param {number} quantity - Jumlah stok barang
 * @param {number} unitCost - Harga modal per unit barang
 * @returns {number} Nilai valuasi item (quantity * unitCost)
 */
function updateCategoryValuation(
  categoryBreakdown,
  categoryName,
  quantity,
  unitCost
) {
  if (!categoryBreakdown[categoryName]) {
    categoryBreakdown[categoryName] = { count: 0, valuation: 0 };
  }

  if (quantity > 0 && unitCost > 0) {
    const itemValuation = quantity * unitCost;
    categoryBreakdown[categoryName].count += quantity;
    categoryBreakdown[categoryName].valuation += itemValuation;
    return itemValuation;
  }

  return 0;
}

/**
 * Menghasilkan laporan analisis stok inventaris gudang beserta valuasi per kategori.
 * @param {Array<{sku?: string, name?: string, qty?: number, cost?: number, cat?: string}>} inventoryItems - Daftar barang
 * @param {number} [lowStockThreshold=10] - Ambang batas stok minimum
 * @returns {{
 *   totalItems: number,
 *   totalValuation: number,
 *   lowStockItems: Array<object>,
 *   outOfStockItems: Array<object>,
 *   categoryBreakdown: Object.<string, {count: number, valuation: number}>,
 *   needsRestock: boolean
 * }} Laporan ringkasan inventaris
 */
function generateInventoryReport(inventoryItems, lowStockThreshold) {
  if (!inventoryItems || !Array.isArray(inventoryItems)) {
    return {
      totalItems: 0,
      totalValuation: 0,
      lowStockItems: [],
      outOfStockItems: [],
      categoryBreakdown: {},
      needsRestock: false,
    };
  }

  const effectiveThreshold = lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
  let totalValuation = 0;
  const lowStockItems = [];
  const outOfStockItems = [];
  const categoryBreakdown = {};

  for (let i = 0; i < inventoryItems.length; i += 1) {
    const currentItem = inventoryItems[i];
    if (currentItem && currentItem.name) {
      const quantity = currentItem.qty ?? 0;
      const unitCost = currentItem.cost ?? 0;
      const categoryName = currentItem.cat || 'UNCATEGORIZED';

      classifyStockLevel(
        currentItem,
        effectiveThreshold,
        lowStockItems,
        outOfStockItems
      );
      totalValuation += updateCategoryValuation(
        categoryBreakdown,
        categoryName,
        quantity,
        unitCost
      );
    }
  }

  return {
    totalItems: inventoryItems.length,
    totalValuation: Math.round(totalValuation),
    lowStockItems,
    outOfStockItems,
    categoryBreakdown,
    needsRestock: lowStockItems.length > 0 || outOfStockItems.length > 0,
  };
}

module.exports = {
  generateInventoryReport,
};
