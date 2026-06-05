const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');

/**
 * Controlador de Proyectos Urbanos
 */
const projectController = {
  /**
   * Crear nuevo proyecto
   * POST /api/v1/projects
   */
  createProject: async (req, res) => {
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

      const {
        name,
        description,
        code,
        status,
        budget,
        startDate,
        endDate,
        location,
        coordinates,
        managerId
      } = req.body;

      // Verificar si el código ya existe
      const existingProject = await Project.findOne({ where: { code } });
      if (existingProject) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un proyecto con ese código'
        });
      }

      // Si se proporciona managerId, verificar que exista
      if (managerId) {
        const manager = await User.findByPk(managerId);
        if (!manager) {
          return res.status(404).json({
            success: false,
            message: 'El manager especificado no existe'
          });
        }
      }

      // Crear proyecto
      const project = await Project.create({
        name,
        description,
        code,
        status: status || 'planning',
        budget,
        startDate,
        endDate,
        location,
        coordinates,
        managerId: managerId || req.user.id // Por defecto, el usuario que crea es el manager
      });

      res.status(201).json({
        success: true,
        message: 'Proyecto creado exitosamente',
        data: { project }
      });
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear proyecto',
        error: error.message
      });
    }
  },

  /**
   * Obtener todos los proyectos con paginación y filtros
   * GET /api/v1/projects
   */
  getAllProjects: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        managerId,
        search
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Aplicar filtros
      if (status) where.status = status;
      if (managerId) where.managerId = managerId;
      if (search) {
        where.$or = [
          { name: { $iLike: `%${search}%` } },
          { code: { $iLike: `%${search}%` } },
          { description: { $iLike: `%${search}%` } }
        ];
      }

      const { count, rows } = await Project.findAndCountAll({
        where,
        include: [{
          model: User,
          as: 'manager',
          attributes: ['id', 'username', 'email']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          projects: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit),
            hasMore: offset + rows.length < count
          }
        }
      });
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener proyectos',
        error: error.message
      });
    }
  },

  /**
   * Obtener proyecto por ID
   * GET /api/v1/projects/:id
   */
  getProjectById: async (req, res) => {
    try {
      const { id } = req.params;

      const project = await Project.findByPk(id, {
        include: [{
          model: User,
          as: 'manager',
          attributes: ['id', 'username', 'email', 'role']
        }]
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Proyecto no encontrado'
        });
      }

      res.json({
        success: true,
        data: { project }
      });
    } catch (error) {
      console.error('Error al obtener proyecto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener proyecto',
        error: error.message
      });
    }
  },

  /**
   * Actualizar proyecto
   * PUT /api/v1/projects/:id
   */
  updateProject: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const project = await Project.findByPk(id);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Proyecto no encontrado'
        });
      }

      // Verificar permisos (solo manager o admin puede editar)
      if (req.user.role !== 'admin' && project.managerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para editar este proyecto'
        });
      }

      // Si se cambia el código, verificar que no exista
      if (updateData.code && updateData.code !== project.code) {
        const existingProject = await Project.findOne({ where: { code: updateData.code } });
        if (existingProject) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe un proyecto con ese código'
          });
        }
      }

      await project.update(updateData);

      // Recargar proyecto con relaciones
      const updatedProject = await Project.findByPk(id, {
        include: [{
          model: User,
          as: 'manager',
          attributes: ['id', 'username', 'email']
        }]
      });

      res.json({
        success: true,
        message: 'Proyecto actualizado exitosamente',
        data: { project: updatedProject }
      });
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar proyecto',
        error: error.message
      });
    }
  },

  /**
   * Eliminar proyecto
   * DELETE /api/v1/projects/:id
   */
  deleteProject: async (req, res) => {
    try {
      const { id } = req.params;

      const project = await Project.findByPk(id);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Proyecto no encontrado'
        });
      }

      // Verificar permisos (solo admin puede eliminar)
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden eliminar proyectos'
        });
      }

      await project.destroy();

      res.json({
        success: true,
        message: 'Proyecto eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar proyecto',
        error: error.message
      });
    }
  },

  /**
   * Obtener estadísticas de proyectos
   * GET /api/v1/projects/stats
   */
  getProjectStats: async (req, res) => {
    try {
      const stats = await Project.findAll({
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
          [require('sequelize').fn('SUM', require('sequelize').col('budget')), 'totalBudget']
        ],
        group: ['status'],
        raw: true
      });

      const totalProjects = await Project.count();
      const activeProjects = await Project.count({ where: { status: 'active' } });

      res.json({
        success: true,
        data: {
          byStatus: stats,
          summary: {
            totalProjects,
            activeProjects,
            completionRate: totalProjects > 0 
              ? ((await Project.count({ where: { status: 'completed' })) / totalProjects) * 100 
              : 0
          }
        }
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }
};

module.exports = projectController;
