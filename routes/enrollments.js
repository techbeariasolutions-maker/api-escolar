const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Datos de ejemplo de inscripciones
let enrollments = [
  {
    id: 1,
    estudianteId: 1,
    grupoId: 1,
    fechaInscripcion: '2024-01-20',
    estado: 'activo', // activo, completado, cancelado, retirado
    calificacion: null,
    asistencia: 95,
    notas: 'Estudiante destacado'
  },
  {
    id: 2,
    estudianteId: 2,
    grupoId: 1,
    fechaInscripcion: '2024-01-21',
    estado: 'activo',
    calificacion: null,
    asistencia: 88,
    notas: ''
  },
  {
    id: 3,
    estudianteId: 1,
    grupoId: 2,
    fechaInscripcion: '2024-01-22',
    estado: 'activo',
    calificacion: null,
    asistencia: 92,
    notas: ''
  }
];

// GET /api/enrollments - Obtener todas las inscripciones
router.get('/', authMiddleware, (req, res) => {
  try {
    const { estudianteId, grupoId, estado } = req.query;
    
    let filteredEnrollments = [...enrollments];
    
    // Filtrar por estudiante
    if (estudianteId) {
      filteredEnrollments = filteredEnrollments.filter(
        e => e.estudianteId === parseInt(estudianteId)
      );
    }
    
    // Filtrar por grupo
    if (grupoId) {
      filteredEnrollments = filteredEnrollments.filter(
        e => e.grupoId === parseInt(grupoId)
      );
    }
    
    // Filtrar por estado
    if (estado) {
      filteredEnrollments = filteredEnrollments.filter(
        e => e.estado === estado
      );
    }
    
    res.json({
      success: true,
      count: filteredEnrollments.length,
      data: filteredEnrollments
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
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const enrollmentId = parseInt(req.params.id);
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    
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
router.post('/', authMiddleware, (req, res) => {
  try {
    const { estudianteId, grupoId, notas } = req.body;
    
    // Validaciones básicas
    if (!estudianteId || !grupoId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Estudiante ID y Grupo ID son requeridos' 
      });
    }
    
    // Verificar si ya existe una inscripción activa
    const existingEnrollment = enrollments.find(
      e => e.estudianteId === parseInt(estudianteId) && 
           e.grupoId === parseInt(grupoId) &&
           e.estado === 'activo'
    );
    
    if (existingEnrollment) {
      return res.status(400).json({ 
        success: false, 
        message: 'El estudiante ya está inscrito en este grupo' 
      });
    }
    
    // NOTA: Aquí deberías verificar:
    // 1. Que el estudiante existe
    // 2. Que el grupo existe
    // 3. Que el grupo tiene cupos disponibles
    // Por ahora lo omitimos para simplicidad
    
    // Crear nueva inscripción
    const newEnrollment = {
      id: enrollments.length > 0 ? Math.max(...enrollments.map(e => e.id)) + 1 : 1,
      estudianteId: parseInt(estudianteId),
      grupoId: parseInt(grupoId),
      fechaInscripcion: new Date().toISOString().split('T')[0],
      estado: 'activo',
      calificacion: null,
      asistencia: 0,
      notas: notas || ''
    };
    
    enrollments.push(newEnrollment);
    
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
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const enrollmentId = parseInt(req.params.id);
    const enrollmentIndex = enrollments.findIndex(e => e.id === enrollmentId);
    
    if (enrollmentIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Inscripción no encontrada' 
      });
    }
    
    const { estado, calificacion, asistencia, notas } = req.body;
    
    // Validar estado
    const estadosValidos = ['activo', 'completado', 'cancelado', 'retirado'];
    if (estado && !estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Estado no válido. Debe ser: activo, completado, cancelado o retirado' 
      });
    }
    
    // Validar calificación (0-100)
    if (calificacion !== undefined && (calificacion < 0 || calificacion > 100)) {
      return res.status(400).json({ 
        success: false, 
        message: 'La calificación debe estar entre 0 y 100' 
      });
    }
    
    // Validar asistencia (0-100)
    if (asistencia !== undefined && (asistencia < 0 || asistencia > 100)) {
      return res.status(400).json({ 
        success: false, 
        message: 'La asistencia debe estar entre 0 y 100' 
      });
    }
    
    // Actualizar campos
    enrollments[enrollmentIndex] = {
      ...enrollments[enrollmentIndex],
      estado: estado !== undefined ? estado : enrollments[enrollmentIndex].estado,
      calificacion: calificacion !== undefined ? calificacion : enrollments[enrollmentIndex].calificacion,
      asistencia: asistencia !== undefined ? asistencia : enrollments[enrollmentIndex].asistencia,
      notas: notas !== undefined ? notas : enrollments[enrollmentIndex].notas
    };
    
    res.json({
      success: true,
      message: 'Inscripción actualizada exitosamente',
      data: enrollments[enrollmentIndex]
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
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const enrollmentId = parseInt(req.params.id);
    const enrollmentIndex = enrollments.findIndex(e => e.id === enrollmentId);
    
    if (enrollmentIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Inscripción no encontrada' 
      });
    }
    
    // Cambiar estado a cancelado en lugar de eliminar
    enrollments[enrollmentIndex].estado = 'cancelado';
    
    res.json({
      success: true,
      message: 'Inscripción cancelada exitosamente',
      data: enrollments[enrollmentIndex]
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
router.get('/student/:estudianteId', authMiddleware, (req, res) => {
  try {
    const estudianteId = parseInt(req.params.estudianteId);
    const studentEnrollments = enrollments.filter(
      e => e.estudianteId === estudianteId
    );
    
    res.json({
      success: true,
      count: studentEnrollments.length,
      data: studentEnrollments
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
router.get('/group/:grupoId', authMiddleware, (req, res) => {
  try {
    const grupoId = parseInt(req.params.grupoId);
    const groupEnrollments = enrollments.filter(
      e => e.grupoId === grupoId && e.estado === 'activo'
    );
    
    res.json({
      success: true,
      count: groupEnrollments.length,
      data: groupEnrollments
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener inscripciones del grupo',
      error: error.message 
    });
  }
});

// GET /api/enrollments/stats - Estadísticas generales
router.get('/stats/general', authMiddleware, (req, res) => {
  try {
    const totalEnrollments = enrollments.length;
    const activeEnrollments = enrollments.filter(e => e.estado === 'activo').length;
    const completedEnrollments = enrollments.filter(e => e.estado === 'completado').length;
    const canceledEnrollments = enrollments.filter(e => e.estado === 'cancelado').length;
    
    res.json({
      success: true,
      data: {
        total: totalEnrollments,
        activas: activeEnrollments,
        completadas: completedEnrollments,
        canceladas: canceledEnrollments,
        tasaCompletacion: totalEnrollments > 0 
          ? ((completedEnrollments / totalEnrollments) * 100).toFixed(2) 
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
