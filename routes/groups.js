const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { Group } = require('../db');
const { Op } = require('sequelize');

// GET /api/groups - Obtener todos los grupos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { activo, disponible, search } = req.query;

    const where = {};

    // Filtrar por estado activo
    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    // Filtrar grupos con cupos disponibles
    if (disponible === 'true') {
      where.estado = 'abierto';
    }

    let groups = await Group.findAll({ where });

    // Filtrar disponibilidad por cupos (después de obtener)
    if (disponible === 'true') {
      groups = groups.filter(g => g.estudiantesInscritos < g.capacidadMaxima);
    }

    // Buscar por nombre, código o profesor
    if (search) {
      const searchLower = search.toLowerCase();
      groups = groups.filter(g =>
        g.nombre.toLowerCase().includes(searchLower) ||
        g.codigo.toLowerCase().includes(searchLower) ||
        (g.profesor && g.profesor.toLowerCase().includes(searchLower))
      );
    }

    res.json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener grupos',
      error: error.message
    });
  }
});

// GET /api/groups/:id - Obtener un grupo específico
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener grupo',
      error: error.message
    });
  }
});

// POST /api/groups - Crear nuevo grupo
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, codigo, descripcion, capacidadMaxima, profesor, periodo, estado } = req.body;

    // Validaciones básicas
    if (!nombre || !codigo) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y código son requeridos'
      });
    }

    // Verificar código duplicado
    const codigoExists = await Group.findOne({ where: { codigo } });
    if (codigoExists) {
      return res.status(400).json({
        success: false,
        message: 'El código del grupo ya existe'
      });
    }

    const newGroup = await Group.create({
      nombre,
      codigo,
      descripcion: descripcion || '',
      capacidadMaxima: capacidadMaxima || 30,
      estudiantesInscritos: 0,
      profesor: profesor || '',
      periodo: periodo || '',
      estado: estado || 'abierto',
      activo: true
    });

    res.status(201).json({
      success: true,
      message: 'Grupo creado exitosamente',
      data: newGroup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear grupo',
      error: error.message
    });
  }
});

// PUT /api/groups/:id - Actualizar grupo
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    const { nombre, codigo, descripcion, capacidadMaxima, profesor, periodo, estado, activo } = req.body;

    // Verificar código duplicado (excepto el propio)
    if (codigo && codigo !== group.codigo) {
      const codigoExists = await Group.findOne({ where: { codigo } });
      if (codigoExists) {
        return res.status(400).json({
          success: false,
          message: 'El código del grupo ya existe'
        });
      }
    }

    await group.update({
      nombre: nombre !== undefined ? nombre : group.nombre,
      codigo: codigo !== undefined ? codigo : group.codigo,
      descripcion: descripcion !== undefined ? descripcion : group.descripcion,
      capacidadMaxima: capacidadMaxima !== undefined ? capacidadMaxima : group.capacidadMaxima,
      profesor: profesor !== undefined ? profesor : group.profesor,
      periodo: periodo !== undefined ? periodo : group.periodo,
      estado: estado !== undefined ? estado : group.estado,
      activo: activo !== undefined ? activo : group.activo
    });

    res.json({
      success: true,
      message: 'Grupo actualizado exitosamente',
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar grupo',
      error: error.message
    });
  }
});

// DELETE /api/groups/:id - Eliminar grupo (soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    // Soft delete - marcar como inactivo
    await group.update({ activo: false });

    res.json({
      success: true,
      message: 'Grupo desactivado exitosamente',
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar grupo',
      error: error.message
    });
  }
});

// GET /api/groups/:id/availability - Verificar disponibilidad de cupos
router.get('/:id/availability', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    const cuposDisponibles = group.capacidadMaxima - group.estudiantesInscritos;
    const disponible = cuposDisponibles > 0 && group.activo && group.estado === 'abierto';

    res.json({
      success: true,
      data: {
        grupoId: group.id,
        nombre: group.nombre,
        capacidadMaxima: group.capacidadMaxima,
        estudiantesInscritos: group.estudiantesInscritos,
        cuposDisponibles: cuposDisponibles,
        disponible: disponible,
        porcentajeOcupacion: ((group.estudiantesInscritos / group.capacidadMaxima) * 100).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar disponibilidad',
      error: error.message
    });
  }
});

module.exports = router;
