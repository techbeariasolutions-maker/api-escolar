const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// NOTA: En producción, estos datos vendrían de tu base de datos
// Este es solo un ejemplo con datos en memoria
let students = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    email: 'juan.perez@email.com',
    telefono: '555-0101',
    fechaNacimiento: '2005-03-15',
    direccion: 'Calle Principal 123',
    activo: true,
    fechaRegistro: '2024-01-15'
  },
  {
    id: 2,
    nombre: 'María García',
    email: 'maria.garcia@email.com',
    telefono: '555-0102',
    fechaNacimiento: '2004-07-22',
    direccion: 'Avenida Central 456',
    activo: true,
    fechaRegistro: '2024-01-16'
  }
];

// GET /api/students - Obtener todos los estudiantes
router.get('/', authMiddleware, (req, res) => {
  try {
    // Filtros opcionales desde query params
    const { activo, search } = req.query;
    
    let filteredStudents = [...students];
    
    // Filtrar por estado activo
    if (activo !== undefined) {
      const isActive = activo === 'true';
      filteredStudents = filteredStudents.filter(s => s.activo === isActive);
    }
    
    // Buscar por nombre o email
    if (search) {
      const searchLower = search.toLowerCase();
      filteredStudents = filteredStudents.filter(s => 
        s.nombre.toLowerCase().includes(searchLower) ||
        s.email.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({
      success: true,
      count: filteredStudents.length,
      data: filteredStudents
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
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const student = students.find(s => s.id === studentId);
    
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
router.post('/', authMiddleware, (req, res) => {
  try {
    const { nombre, email, telefono, fechaNacimiento, direccion } = req.body;
    
    // Validaciones básicas
    if (!nombre || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre y email son requeridos' 
      });
    }
    
    // Verificar email duplicado
    const emailExists = students.some(s => s.email === email);
    if (emailExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'El email ya está registrado' 
      });
    }
    
    // Crear nuevo estudiante
    const newStudent = {
      id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1,
      nombre,
      email,
      telefono: telefono || '',
      fechaNacimiento: fechaNacimiento || '',
      direccion: direccion || '',
      activo: true,
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
    
    students.push(newStudent);
    
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
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const studentIndex = students.findIndex(s => s.id === studentId);
    
    if (studentIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Estudiante no encontrado' 
      });
    }
    
    const { nombre, email, telefono, fechaNacimiento, direccion, activo } = req.body;
    
    // Verificar email duplicado (excepto el propio)
    if (email && email !== students[studentIndex].email) {
      const emailExists = students.some(s => s.email === email && s.id !== studentId);
      if (emailExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'El email ya está registrado' 
        });
      }
    }
    
    // Actualizar campos
    students[studentIndex] = {
      ...students[studentIndex],
      nombre: nombre || students[studentIndex].nombre,
      email: email || students[studentIndex].email,
      telefono: telefono !== undefined ? telefono : students[studentIndex].telefono,
      fechaNacimiento: fechaNacimiento !== undefined ? fechaNacimiento : students[studentIndex].fechaNacimiento,
      direccion: direccion !== undefined ? direccion : students[studentIndex].direccion,
      activo: activo !== undefined ? activo : students[studentIndex].activo
    };
    
    res.json({
      success: true,
      message: 'Estudiante actualizado exitosamente',
      data: students[studentIndex]
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
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const studentIndex = students.findIndex(s => s.id === studentId);
    
    if (studentIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Estudiante no encontrado' 
      });
    }
    
    // Soft delete - marcar como inactivo
    students[studentIndex].activo = false;
    
    res.json({
      success: true,
      message: 'Estudiante desactivado exitosamente',
      data: students[studentIndex]
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
router.delete('/:id/permanent', authMiddleware, (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const studentIndex = students.findIndex(s => s.id === studentId);
    
    if (studentIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Estudiante no encontrado' 
      });
    }
    
    // Eliminar permanentemente
    const deletedStudent = students.splice(studentIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Estudiante eliminado permanentemente',
      data: deletedStudent
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
