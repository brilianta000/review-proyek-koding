const { processOrderCheckout } = require('./orderProcessor');
const { authenticateUserAccount } = require('./authService');
const { generateInventoryReport } = require('./inventoryManager');

module.exports = {
  processOrderCheckout,
  authenticateUserAccount,
  generateInventoryReport,
};
