const express = require('express');
const router = express.Router();
const { register, login, updatePassword, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin, validatePasswordUpdate } = require('../middleware/validators');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticate, getMe);
router.put('/update-password', authenticate, validatePasswordUpdate, updatePassword);

module.exports = router;
