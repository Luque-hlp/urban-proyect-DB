const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const projectRoutes = require('./projectRoutes');

/**
 * Enrutador principal de la API v1
 * Prefijo: /api/v1
 */

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de proyectos
router.use('/projects', projectRoutes);

// Ruta de prueba
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Urban Proyect DB v1',
    endpoints: {
      auth: '/api/v1/auth',
      projects: '/api/v1/projects'
    },
    documentation: '/docs'
  });
});

module.exports = router;
