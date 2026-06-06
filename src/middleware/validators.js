const { body, param, query } = require('express-validator');

/**
 * Validadores para rutas de usuarios
 */
const userValidators = {
  // Validación para creación de usuario
  createUser: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('El username debe tener entre 3 y 50 caracteres')
      .isAlphanumeric()
      .withMessage('El username solo puede contener letras y números'),
    
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Debe proporcionar un email válido'),
    
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/\d/)
      .withMessage('La contraseña debe contener al menos un número'),
    
    body('role')
      .optional()
      .isIn(['admin', 'manager', 'viewer'])
      .withMessage('El rol debe ser admin, manager o viewer')
  ],

  // Validación para actualización de usuario
  updateUser: [
    param('id')
      .isUUID()
      .withMessage('ID de usuario inválido'),
    
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('El username debe tener entre 3 y 50 caracteres')
      .isAlphanumeric()
      .withMessage('El username solo puede contener letras y números'),
    
    body('email')
      .optional()
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Debe proporcionar un email válido'),
    
    body('role')
      .optional()
      .isIn(['admin', 'manager', 'viewer'])
      .withMessage('El rol debe ser admin, manager o viewer')
  ],

  // Validación para login
  login: [
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Debe proporcionar un email válido'),
    
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida')
  ]
};

/**
 * Validadores para rutas de proyectos
 */
const projectValidators = {
  // Validación para creación de proyecto
  createProject: [
    body('name')
      .trim()
      .isLength({ min: 3, max: 150 })
      .withMessage('El nombre del proyecto debe tener entre 3 y 150 caracteres'),
    
    body('description')
      .optional()
      .trim(),
    
    body('code')
      .trim()
      .matches(/^[A-Z]{2,4}-\d{4,6}$/)
      .withMessage('El código debe seguir el formato: XX-NNNNNN (ej: UR-2024001)'),
    
    body('status')
      .optional()
      .isIn(['planning', 'active', 'on_hold', 'completed', 'cancelled'])
      .withMessage('Estado inválido'),
    
    body('budget')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('El presupuesto debe ser un número positivo'),
    
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de inicio inválida'),
    
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de fin inválida'),
    
    body('location')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('La ubicación no puede exceder 255 caracteres'),
    
    body('managerId')
      .optional()
      .isUUID()
      .withMessage('ID de manager inválido')
  ],

  // Validación para obtener proyecto por ID
  getProjectById: [
    param('id')
      .isUUID()
      .withMessage('ID de proyecto inválido')
  ],

  // Validación para actualizar proyecto
  updateProject: [
    param('id')
      .isUUID()
      .withMessage('ID de proyecto inválido'),
    
    ...createProject.slice(1) // Reutiliza validaciones de creación (menos code que es único)
  ],

  // Validación para listar proyectos con filtros
  listProjects: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La página debe ser un entero positivo'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El límite debe estar entre 1 y 100'),
    
    query('status')
      .optional()
      .isIn(['planning', 'active', 'on_hold', 'completed', 'cancelled'])
      .withMessage('Estado inválido'),
    
    query('managerId')
      .optional()
      .isUUID()
      .withMessage('ID de manager inválido')
  ]
};

module.exports = {
  userValidators,
  projectValidators
};
