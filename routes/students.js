const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { Student } = require('../db');

// GET /api/students - Obtener todos los estudiantes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { activo, search } = req.query;

    const where = {};

    // Filtrar por estado activo
    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    let students = await Student.findAll({ where });

    // Buscar por nombre o email (filtro en memoria después de obtener)
    if (search) {
      const searchLower = search.toLowerCase();
      students = students.filter(s =>
        s.nombre.toLowerCase().includes(searchLower) ||
        s.email.toLowerCase().includes(searchLower) ||
        (s.matricula && s.matricula.toLowerCase().includes(searchLower))
      );
    }

    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estudiantes',
      error: error.message
    });
  }
});

// GET /api/students/:id - Obtener un estudiante específico
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estudiante',
      error: error.message
    });
  }
});

// POST /api/students - Crear nuevo estudiante
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, email, telefono, direccion, edad, matricula, estado } = req.body;

    // Validaciones básicas
    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y email son requeridos'
      });
    }

    // Verificar email duplicado
    const emailExists = await Student.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Verificar matrícula duplicada (si se envía)
    if (matricula) {
      const matriculaExists = await Student.findOne({ where: { matricula } });
      if (matriculaExists) {
        return res.status(400).json({
          success: false,
          message: 'La matrícula ya existe'
        });
      }
    }

    const newStudent = await Student.create({
      nombre,
      email,
      telefono: telefono || '',
      direccion: direccion || '',
      edad: edad || null,
      matricula: matricula || null,
      estado: estado || 'activo',
      activo: true
    });

    res.status(201).json({
      success: true,
      message: 'Estudiante creado exitosamente',
      data: newStudent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear estudiante',
      error: error.message
    });
  }
});

// PUT /api/students/:id - Actualizar estudiante
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    const { nombre, email, telefono, direccion, edad, matricula, estado, activo } = req.body;

    // Verificar email duplicado (excepto el propio)
    if (email && email !== student.email) {
      const emailExists = await Student.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
    }

    // Verificar matrícula duplicada (excepto la propia)
    if (matricula && matricula !== student.matricula) {
      const matriculaExists = await Student.findOne({ where: { matricula } });
      if (matriculaExists) {
        return res.status(400).json({
          success: false,
          message: 'La matrícula ya existe'
        });
      }
    }

    await student.update({
      nombre: nombre !== undefined ? nombre : student.nombre,
      email: email !== undefined ? email : student.email,
      telefono: telefono !== undefined ? telefono : student.telefono,
      direccion: direccion !== undefined ? direccion : student.direccion,
      edad: edad !== undefined ? edad : student.edad,
      matricula: matricula !== undefined ? matricula : student.matricula,
      estado: estado !== undefined ? estado : student.estado,
      activo: activo !== undefined ? activo : student.activo
    });

    res.json({
      success: true,
      message: 'Estudiante actualizado exitosamente',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estudiante',
      error: error.message
    });
  }
});

// DELETE /api/students/:id - Eliminar estudiante (soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    // Soft delete - marcar como inactivo
    await student.update({ activo: false });

    res.json({
      success: true,
      message: 'Estudiante desactivado exitosamente',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar estudiante',
      error: error.message
    });
  }
});

// DELETE /api/students/:id/permanent - Eliminar permanentemente
router.delete('/:id/permanent', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    await student.destroy();

    res.json({
      success: true,
      message: 'Estudiante eliminado permanentemente',
      data: { id: req.params.id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar estudiante',
      error: error.message
    });
  }
});

module.exports = router;
