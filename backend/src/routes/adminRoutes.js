const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getStores,
  createStore,
  updateStore,
  deleteStore
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateAdminUser, validateAdminUserUpdate, validateStore } = require('../middleware/validators');

const adminOnly = [authenticate, authorize('admin')];

router.get('/dashboard', ...adminOnly, getDashboardStats);
router.get('/users', ...adminOnly, getUsers);
router.get('/users/:id', ...adminOnly, getUserById);
router.post('/users', ...adminOnly, validateAdminUser, createUser);
router.put('/users/:id', ...adminOnly, validateAdminUserUpdate, updateUser);
router.delete('/users/:id', ...adminOnly, deleteUser);

router.get('/stores', ...adminOnly, getStores);
router.post('/stores', ...adminOnly, validateStore, createStore);
router.put('/stores/:id', ...adminOnly, validateStore, updateStore);
router.delete('/stores/:id', ...adminOnly, deleteStore);

module.exports = router;
