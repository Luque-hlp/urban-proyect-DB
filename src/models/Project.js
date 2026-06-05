const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db-connection');

/**
 * Modelo de Proyecto Urbano
 * Representa los proyectos de desarrollo urbano gestionados en el sistema
 */
const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      len: [3, 150]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      is: /^[A-Z]{2,4}-\d{4,6}$/ // Ejemplo: UR-2024001
    }
  },
  status: {
    type: DataTypes.ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled'),
    defaultValue: 'planning'
  },
  budget: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isAfterStartDate(value) {
        if (this.startDate && value) {
          if (new Date(value) <= new Date(this.startDate)) {
            throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
          }
        }
      }
    }
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  coordinates: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Coordenadas GeoJSON del proyecto'
  },
  managerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'projects',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['code'] },
    { fields: ['status'] },
    { fields: ['manager_id'] },
    { fields: ['start_date'] },
    { fields: ['end_date'] }
  ]
});

module.exports = Project;
