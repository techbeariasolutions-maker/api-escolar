const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authMiddleware } = require('../middleware/auth');
const { Enrollment } = require('../db');

// GET /api/enrollments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { estudianteId, grupoId, estado } = req.query;
    const where = {};

    if (estudianteId) where.estudianteId = parseInt(estudianteId);
    if (grupoId)      where.grupoId      = parseInt(grupoId);
    if (estado)       where.estado       = estado;

    const enrollments = await Enrollment.findAll({ where });

    res.json({ success: true, count: enrollments.length, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener inscripciones', error: error.message });
  }
});

// GET /api/enrollments/stats/general   ← NOTA: rutas estáticas ANTES de /:id
router.get('/stats/general', authMiddleware, async (req, res) => {
  try {
    const total     = await Enrollment.count();
    const activas   = await Enrollment.count({ where: { estado: 'activo' } });
    const completadas = await Enrollment.count({ where: { estado: 'completado' } });
    const canceladas  = await Enrollment.count({ where: { estado: 'cancelado' } });

    res.json({
      success: true,
      data: {
        total,
        activas,
        completadas,
        canceladas,
        tasaCompletacion: total > 0 ? ((completadas / total) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas', error: error.message });
  }
});

// GET /api/enrollments/student/:estudianteId
router.get('/student/:estudianteId', authMiddleware, async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { estudianteId: parseInt(req.params.estudianteId) }
    });

    res.json({ success: true, count: enrollments.length, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener inscripciones del estudiante', error: error.message });
  }
});

// GET /api/enrollments/group/:grupoId
router.get('/group/:grupoId', authMiddleware, async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { grupoId: parseInt(req.params.grupoId), estado: 'activo' }
    });

    res.json({ success: true, count: enrollments.length, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener inscripciones del grupo', error: error.message });
  }
});

// GET /api/enrollments/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(parseInt(req.params.id));

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
    }

    res.json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener inscripción', error: error.message });
  }
});

// POST /api/enrollments
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { estudianteId, grupoId, notas } = req.body;

    if (!estudianteId || !grupoId) {
      return res.status(400).json({ success: false, message: 'Estudiante ID y Grupo ID son requeridos' });
    }

    // Verificar inscripción activa duplicada
    const existing = await Enrollment.findOne({
      where: {
        estudianteId: parseInt(estudianteId),
        grupoId:      parseInt(grupoId),
        estado:       'activo'
      }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'El estudiante ya está inscrito en este grupo' });
    }

    const newEnrollment = await Enrollment.create({
      estudianteId:     parseInt(estudianteId),
      grupoId:          parseInt(grupoId),
      fechaInscripcion: new Date().toISOString().split('T')[0],
      estado:           'activo',
      calificacion:     null,
      asistencia:       0,
      notas:            notas || ''
    });

    res.status(201).json({ success: true, message: 'Inscripción creada exitosamente', data: newEnrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear inscripción', error: error.message });
  }
});

// PUT /api/enrollments/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(parseInt(req.params.id));

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
    }

    const { estado, calificacion, asistencia, notas } = req.body;

    // Validar estado
    const estadosValidos = ['activo', 'completado', 'cancelado', 'retirado'];
    if (estado && !estadosValidos.includes(estado)) {
      return res.status(400).json({ success: false, message: 'Estado no válido. Debe ser: activo, completado, cancelado o retirado' });
    }

    // Validar calificación 0-100
    if (calificacion !== undefined && calificacion !== null && (calificacion < 0 || calificacion > 100)) {
      return res.status(400).json({ success: false, message: 'La calificación debe estar entre 0 y 100' });
    }

    // Validar asistencia 0-100
    if (asistencia !== undefined && (asistencia < 0 || asistencia > 100)) {
      return res.status(400).json({ success: false, message: 'La asistencia debe estar entre 0 y 100' });
    }

    await enrollment.update({
      estado:       estado       !== undefined ? estado       : enrollment.estado,
      calificacion: calificacion !== undefined ? calificacion : enrollment.calificacion,
      asistencia:   asistencia   !== undefined ? asistencia   : enrollment.asistencia,
      notas:        notas        !== undefined ? notas        : enrollment.notas
    });

    res.json({ success: true, message: 'Inscripción actualizada exitosamente', data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar inscripción', error: error.message });
  }
});

// DELETE /api/enrollments/:id  — soft delete (estado = cancelado)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(parseInt(req.params.id));

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
    }

    await enrollment.update({ estado: 'cancelado' });

    res.json({ success: true, message: 'Inscripción cancelada exitosamente', data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al cancelar inscripción', error: error.message });
  }
});

module.exports = router;
