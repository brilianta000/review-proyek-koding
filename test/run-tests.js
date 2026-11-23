const assert = require('assert');
const {
  processOrderCheckout,
  authenticateUserAccount,
  generateInventoryReport,
} = require('../src/index');

let passedCount = 0;

function runTest(testName, fn) {
  fn();
  passedCount += 1;
}

// 1. Order Processor Tests
runTest('processOrderCheckout calculates VIP order with coupon', () => {
  const order = {
    items: [
      { q: 2, pr: 300000, w: 1 },
      { q: 1, pr: 500000, w: 2 },
    ],
  };
  const user = { t: 'VIP' };
  const result = processOrderCheckout(order, user, 'HEMAT50');

  assert.strictEqual(result.subtotal, 1100000);
  assert.strictEqual(result.discount, 270000);
  assert.strictEqual(result.shipping, 32000);
  assert.strictEqual(result.tax, 91300);
  assert.strictEqual(result.finalTotal, 955800);
  assert.strictEqual(result.status, 'SUCCESS');
});

runTest('processOrderCheckout handles empty order gracefully', () => {
  const result = processOrderCheckout({ items: [] }, { t: 'REGULAR' }, null);
  assert.strictEqual(result.finalTotal, 0);
  assert.strictEqual(result.status, 'EMPTY_ITEMS');
});

// 2. Auth Service Tests
runTest('authenticateUserAccount authenticates valid regular user', () => {
  const mockDb = [
    {
      username: 'budi_santoso',
      password: 'hashed_pw_123',
      role: 'STAFF',
      locked: false,
      failedAttempts: 0,
    },
  ];
  const res = authenticateUserAccount('budi_santoso', 'hashed_pw_123', mockDb);
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.role, 'STAFF');
  assert.strictEqual(typeof res.token, 'string');
});

runTest('authenticateUserAccount rejects locked account', () => {
  const mockDb = [
    {
      username: 'locked_user',
      password: 'pw',
      role: 'USER',
      locked: true,
      failedAttempts: 0,
    },
  ];
  const res = authenticateUserAccount('locked_user', 'pw', mockDb);
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.message, 'Account is locked');
});

// 3. Inventory Manager Tests
runTest('generateInventoryReport categorizes low and out of stock items', () => {
  const stockList = [
    { sku: 'SKU-01', name: 'Mechanical Keyboard', qty: 15, cost: 450000, cat: 'Electronics' },
    { sku: 'SKU-02', name: 'Gaming Mouse', qty: 4, cost: 250000, cat: 'Electronics' },
    { sku: 'SKU-03', name: 'USB-C Hub', qty: 0, cost: 150000, cat: 'Accessories' },
  ];
  const report = generateInventoryReport(stockList, 10);

  assert.strictEqual(report.totalItems, 3);
  assert.strictEqual(report.totalValuation, 7750000);
  assert.strictEqual(report.lowStockItems.length, 1);
  assert.strictEqual(report.outOfStockItems.length, 1);
  assert.strictEqual(report.needsRestock, true);
});

process.stdout.write(`All ${passedCount}/${passedCount} unit tests passed!\n`);
