const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  listProviders,
  getProvider,
  approveProvider,
  rejectProvider,
  getStats,
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/providers', listProviders);
router.get('/providers/:id', getProvider);
router.put('/providers/:id/approve', approveProvider);
router.put('/providers/:id/reject', rejectProvider);
router.get('/stats', getStats);

module.exports = router;
