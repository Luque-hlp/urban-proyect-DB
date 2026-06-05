const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

/**
 * Controlador de Autenticación y Usuarios
 */
const authController = {
  /**
   * Registro de nuevo usuario
   * POST /api/v1/auth/register
   */
  register: async (req, res) => {
    try {
      // Validar errores previos del middleware
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { username, email, password, role } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({
        where: {
          $or: [{ email }, { username }]
        }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un usuario con ese email o username'
        });
      }

      // Hashear contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Crear usuario
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role: role || 'viewer'
      });

      // Generar token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar usuario',
        error: error.message
      });
    }
  },

  /**
   * Login de usuario
   * POST /api/v1/auth/login
   */
  login: async (req, res) => {
    try {
      // Validar errores previos del middleware
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Buscar usuario por email
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Usuario inactivo. Contacte al administrador'
        });
      }

      // Actualizar último login
      await user.update({ lastLogin: new Date() });

      // Generar token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión',
        error: error.message
      });
    }
  },

  /**
   * Obtener perfil del usuario actual
   * GET /api/v1/auth/me
   */
  getProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'username', 'email', 'role', 'isActive', 'lastLogin', 'createdAt']
      });

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener perfil',
        error: error.message
      });
    }
  },

  /**
   * Actualizar perfil del usuario
   * PUT /api/v1/auth/profile
   */
  updateProfile: async (req, res) => {
    try {
      const { username, email } = req.body;
      const user = await User.findByPk(req.user.id);

      if (username) user.username = username;
      if (email) user.email = email;

      await user.save();

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: { user }
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar perfil',
        error: error.message
      });
    }
  },

  /**
   * Cambiar contraseña
   * PUT /api/v1/auth/change-password
   */
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(currentPassword, req.user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }

      // Hashear nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await req.user.update({ password: hashedPassword });

      res.json({
        success: true,
        message: 'Contraseña cambiada exitosamente'
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cambiar contraseña',
        error: error.message
      });
    }
  }
};

module.exports = authController;
