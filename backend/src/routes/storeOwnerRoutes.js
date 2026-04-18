const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/storeOwnerController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/dashboard', authenticate, authorize('store_owner'), getDashboard);

module.exports = router;
