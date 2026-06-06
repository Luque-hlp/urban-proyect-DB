const User = require('./User');
const Project = require('./Project');

/**
 * Definición de relaciones entre modelos
 */

// Un usuario puede gestionar múltiples proyectos
User.hasMany(Project, { 
  foreignKey: 'managerId', 
  as: 'managedProjects' 
});

// Un proyecto es gestionado por un usuario (manager)
Project.belongsTo(User, { 
  foreignKey: 'managerId', 
  as: 'manager' 
});

// Exportar todos los modelos
module.exports = {
  User,
  Project,
  // Agrega aquí nuevos modelos cuando los crees
};
