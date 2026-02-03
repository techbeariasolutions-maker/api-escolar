const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authMiddleware } = require('../middleware/auth');
const { Student } = require('../db');

// GET /api/students
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { activo, search } = req.query;
    const where = {};

    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    if (search) {
      const like = `%${search}%`;
      where[Op.or] = [
        { nombre: { [Op.iLike]: like } },
        { email:  { [Op.iLike]: like } }
      ];
    }

    const students = await Student.findAll({ where });

    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener estudiantes', error: error.message });
  }
});

// GET /api/students/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findByPk(parseInt(req.params.id));

    if (!student) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener estudiante', error: error.message });
  }
});

// POST /api/students
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, email, telefono, fechaNacimiento, direccion } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ success: false, message: 'Nombre y email son requeridos' });
    }

    // Email único — Sequelize lanzará UniqueConstraintError, pero verificamos antes para dar mensaje en español
    const exists = await Student.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    const newStudent = await Student.create({
      nombre,
      email,
      telefono:        telefono        || '',
      fechaNacimiento: fechaNacimiento || '',
      direccion:       direccion       || '',
      fechaRegistro:   new Date().toISOString().split('T')[0]
    });

    res.status(201).json({ success: true, message: 'Estudiante creado exitosamente', data: newStudent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear estudiante', error: error.message });
  }
});

// PUT /api/students/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }

    const { nombre, email, telefono, fechaNacimiento, direccion, activo } = req.body;

    // Email único (excepto el propio)
    if (email && email !== student.email) {
      const exists = await Student.findOne({ where: { email, id: { [Op.ne]: studentId } } });
      if (exists) {
        return res.status(400).json({ success: false, message: 'El email ya está registrado' });
      }
    }

    await student.update({
      nombre:          nombre          !== undefined ? nombre          : student.nombre,
      email:           email           !== undefined ? email           : student.email,
      telefono:        telefono        !== undefined ? telefono        : student.telefono,
      fechaNacimiento: fechaNacimiento !== undefined ? fechaNacimiento : student.fechaNacimiento,
      direccion:       direccion       !== undefined ? direccion       : student.direccion,
      activo:          activo          !== undefined ? activo          : student.activo
    });

    res.json({ success: true, message: 'Estudiante actualizado exitosamente', data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar estudiante', error: error.message });
  }
});

// DELETE /api/students/:id  — soft delete
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findByPk(parseInt(req.params.id));

    if (!student) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }

    await student.update({ activo: false });

    res.json({ success: true, message: 'Estudiante desactivado exitosamente', data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar estudiante', error: error.message });
  }
});

// DELETE /api/students/:id/permanent  — hard delete
router.delete('/:id/permanent', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findByPk(parseInt(req.params.id));

    if (!student) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }

    const deleted = student.toJSON();   // guardar datos antes de destruir
    await student.destroy();

    res.json({ success: true, message: 'Estudiante eliminado permanentemente', data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar estudiante', error: error.message });
  }
});

module.exports = router;
