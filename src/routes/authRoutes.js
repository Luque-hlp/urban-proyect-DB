const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { userValidators } = require('../middleware/validators');
const { authenticateToken } = require('../middleware/auth');

/**
 * Rutas de Autenticación
 * Prefijo: /api/v1/auth
 */

// Registro de usuario público
router.post('/register', userValidators.createUser, authController.register);

// Login público
router.post('/login', userValidators.login, authController.login);

// Rutas protegidas (requieren autenticación)
router.get('/me', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
