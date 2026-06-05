const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { projectValidators } = require('../middleware/validators');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/**
 * Rutas de Proyectos
 * Prefijo: /api/v1/projects
 */

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener estadísticas (solo admin y manager)
router.get('/stats', authorizeRoles('admin', 'manager'), projectController.getProjectStats);

// Listar proyectos (todos los usuarios autenticados)
router.get('/', projectValidators.listProjects, projectController.getAllProjects);

// Obtener proyecto por ID
router.get('/:id', projectValidators.getProjectById, projectController.getProjectById);

// Crear proyecto (solo admin y manager)
router.post('/', authorizeRoles('admin', 'manager'), projectValidators.createProject, projectController.createProject);

// Actualizar proyecto (solo admin y manager)
router.put('/:id', authorizeRoles('admin', 'manager'), projectValidators.updateProject, projectController.updateProject);

// Eliminar proyecto (solo admin)
router.delete('/:id', authorizeRoles('admin'), projectController.deleteProject);

module.exports = router;
