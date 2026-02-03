const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { Enrollment, Student, Group } = require('../db');

// GET /api/enrollments - Obtener todas las inscripciones
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { estudianteId, grupoId, estado } = req.query;

    const where = {};

    if (estudianteId) {
      where.estudianteId = parseInt(estudianteId);
    }

    if (grupoId) {
      where.grupoId = parseInt(grupoId);
    }

    if (estado) {
      where.estado = estado;
    }

    const enrollments = await Enrollment.findAll({
      where,
      include: [
        { model: Student, attributes: ['id', 'nombre', 'matricula', 'email'] },
        { model: Group, attributes: ['id', 'nombre', 'codigo', 'profesor'] }
      ]
    });

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener inscripciones',
      error: error.message
    });
  }
});

// GET /api/enrollments/:id - Obtener una inscripción específica
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id, {
      include: [
        { model: Student, attributes: ['id', 'nombre', 'matricula', 'email'] },
        { model: Group, attributes: ['id', 'nombre', 'codigo', 'profesor'] }
      ]
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    res.json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener inscripción',
      error: error.message
    });
  }
});

// POST /api/enrollments - Crear nueva inscripción
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { estudianteId, grupoId, notas } = req.body;

    // Validaciones básicas
    if (!estudianteId || !grupoId) {
      return res.status(400).json({
        success: false,
        message: 'Estudiante ID y Grupo ID son requeridos'
      });
    }

    // Verificar que el estudiante existe
    const student = await Student.findByPk(estudianteId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    // Verificar que el grupo existe
    const group = await Group.findByPk(grupoId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    // Verificar si ya existe una inscripción activa
    const existingEnrollment = await Enrollment.findOne({
      where: {
        estudianteId: parseInt(estudianteId),
        grupoId: parseInt(grupoId),
        estado: 'inscrito'
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'El estudiante ya está inscrito en este grupo'
      });
    }

    // Verificar cupos disponibles
    if (group.estudiantesInscritos >= group.capacidadMaxima) {
      return res.status(400).json({
        success: false,
        message: 'El grupo no tiene cupos disponibles'
      });
    }

    // Crear inscripción
    const newEnrollment = await Enrollment.create({
      estudianteId: parseInt(estudianteId),
      grupoId: parseInt(grupoId),
      fechaInscripcion: new Date(),
      estado: 'inscrito',
      calificacion: null,
      asistencia: null
    });

    // Actualizar cantidad de inscritos del grupo
    await group.update({ estudiantesInscritos: group.estudiantesInscritos + 1 });

    res.status(201).json({
      success: true,
      message: 'Inscripción creada exitosamente',
      data: newEnrollment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear inscripción',
      error: error.message
    });
  }
});

// PUT /api/enrollments/:id - Actualizar inscripción
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    const { estado, calificacion, asistencia } = req.body;

    // Validar estado
    const estadosValidos = ['inscrito', 'cursando', 'completado', 'cancelado'];
    if (estado && !estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido. Debe ser: inscrito, cursando, completado o cancelado'
      });
    }

    // Validar calificación (0-100)
    if (calificacion !== undefined && calificacion !== null && (calificacion < 0 || calificacion > 100)) {
      return res.status(400).json({
        success: false,
        message: 'La calificación debe estar entre 0 y 100'
      });
    }

    // Validar asistencia (0-100)
    if (asistencia !== undefined && asistencia !== null && (asistencia < 0 || asistencia > 100)) {
      return res.status(400).json({
        success: false,
        message: 'La asistencia debe estar entre 0 y 100'
      });
    }

    await enrollment.update({
      estado: estado !== undefined ? estado : enrollment.estado,
      calificacion: calificacion !== undefined ? calificacion : enrollment.calificacion,
      asistencia: asistencia !== undefined ? asistencia : enrollment.asistencia
    });

    res.json({
      success: true,
      message: 'Inscripción actualizada exitosamente',
      data: enrollment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar inscripción',
      error: error.message
    });
  }
});

// DELETE /api/enrollments/:id - Cancelar inscripción
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    // Cambiar estado a cancelado en lugar de eliminar
    await enrollment.update({ estado: 'cancelado' });

    // Decrementar inscritos del grupo
    const group = await Group.findByPk(enrollment.grupoId);
    if (group && group.estudiantesInscritos > 0) {
      await group.update({ estudiantesInscritos: group.estudiantesInscritos - 1 });
    }

    res.json({
      success: true,
      message: 'Inscripción cancelada exitosamente',
      data: enrollment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cancelar inscripción',
      error: error.message
    });
  }
});

// GET /api/enrollments/student/:estudianteId - Inscripciones de un estudiante
router.get('/student/:estudianteId', authMiddleware, async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { estudianteId: parseInt(req.params.estudianteId) },
      include: [
        { model: Group, attributes: ['id', 'nombre', 'codigo', 'profesor'] }
      ]
    });

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener inscripciones del estudiante',
      error: error.message
    });
  }
});

// GET /api/enrollments/group/:grupoId - Inscripciones de un grupo
router.get('/group/:grupoId', authMiddleware, async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: {
        grupoId: parseInt(req.params.grupoId),
        estado: 'inscrito'
      },
      include: [
        { model: Student, attributes: ['id', 'nombre', 'matricula', 'email'] }
      ]
    });

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener inscripciones del grupo',
      error: error.message
    });
  }
});

// GET /api/enrollments/stats/general - Estadísticas generales
router.get('/stats/general', authMiddleware, async (req, res) => {
  try {
    const total = await Enrollment.count();
    const activas = await Enrollment.count({ where: { estado: 'inscrito' } });
    const completadas = await Enrollment.count({ where: { estado: 'completado' } });
    const canceladas = await Enrollment.count({ where: { estado: 'cancelado' } });

    res.json({
      success: true,
      data: {
        total,
        activas,
        completadas,
        canceladas,
        tasaCompletacion: total > 0
          ? ((completadas / total) * 100).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

module.exports = router;
