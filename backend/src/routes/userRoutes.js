const express = require('express');
const router = express.Router();
const { getStores, submitRating, getDashboardStats } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRating } = require('../middleware/validators');

router.get('/dashboard', authenticate, authorize('user'), getDashboardStats);
router.get('/stores', authenticate, authorize('user'), getStores);
router.post('/stores/:storeId/rate', authenticate, authorize('user'), validateRating, submitRating);

module.exports = router;
