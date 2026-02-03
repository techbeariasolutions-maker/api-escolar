const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authMiddleware } = require('../middleware/auth');
const { sequelize, Group } = require('../db');

// GET /api/groups
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { activo, disponible, search } = req.query;
    const where = {};

    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    if (disponible === 'true') {
      // cupos disponibles = capacidadMaxima > estudiantesInscritos
      where.capacidadMaxima      = { [Op.gt]: sequelize.col('estudiantesInscritos') };
      // reusamos activo: true cuando piden disponible
      where.activo = true;
    }

    if (search) {
      const like = `%${search}%`;
      where[Op.or] = [
        { nombre:   { [Op.iLike]: like } },
        { codigo:   { [Op.iLike]: like } },
        { profesor: { [Op.iLike]: like } }
      ];
    }

    const groups = await Group.findAll({ where });

    res.json({ success: true, count: groups.length, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener grupos', error: error.message });
  }
});

// GET /api/groups/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findByPk(parseInt(req.params.id));

    if (!group) {
      return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
    }

    res.json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener grupo', error: error.message });
  }
});

// POST /api/groups
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, codigo, descripcion, capacidadMaxima, profesor, horario, aula, fechaInicio, fechaFin } = req.body;

    if (!nombre || !codigo) {
      return res.status(400).json({ success: false, message: 'Nombre y código son requeridos' });
    }

    const codigoExists = await Group.findOne({ where: { codigo } });
    if (codigoExists) {
      return res.status(400).json({ success: false, message: 'El código del grupo ya existe' });
    }

    const newGroup = await Group.create({
      nombre,
      codigo,
      descripcion:        descripcion        || '',
      capacidadMaxima:    capacidadMaxima    || 30,
      estudiantesInscritos: 0,
      profesor:           profesor           || '',
      horario:            horario            || '',
      aula:               aula               || '',
      activo:             true,
      fechaInicio:        fechaInicio        || '',
      fechaFin:           fechaFin           || ''
    });

    res.status(201).json({ success: true, message: 'Grupo creado exitosamente', data: newGroup });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear grupo', error: error.message });
  }
});

// PUT /api/groups/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
    }

    const updateData = req.body;

    // código único (excepto el propio)
    if (updateData.codigo && updateData.codigo !== group.codigo) {
      const exists = await Group.findOne({ where: { codigo: updateData.codigo, id: { [Op.ne]: groupId } } });
      if (exists) {
        return res.status(400).json({ success: false, message: 'El código del grupo ya existe' });
      }
    }

    // No permitir cambiar el id
    delete updateData.id;

    await group.update(updateData);

    res.json({ success: true, message: 'Grupo actualizado exitosamente', data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar grupo', error: error.message });
  }
});

// DELETE /api/groups/:id  — soft delete (activo = false)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findByPk(parseInt(req.params.id));

    if (!group) {
      return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
    }

    await group.update({ activo: false });

    res.json({ success: true, message: 'Grupo desactivado exitosamente', data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar grupo', error: error.message });
  }
});

// GET /api/groups/:id/availability
router.get('/:id/availability', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findByPk(parseInt(req.params.id));

    if (!group) {
      return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
    }

    const cuposDisponibles = group.capacidadMaxima - group.estudiantesInscritos;

    res.json({
      success: true,
      data: {
        grupoId:             group.id,
        nombre:              group.nombre,
        capacidadMaxima:     group.capacidadMaxima,
        estudiantesInscritos: group.estudiantesInscritos,
        cuposDisponibles,
        disponible:          cuposDisponibles > 0 && group.activo,
        porcentajeOcupacion: ((group.estudiantesInscritos / group.capacidadMaxima) * 100).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al verificar disponibilidad', error: error.message });
  }
});

module.exports = router;
