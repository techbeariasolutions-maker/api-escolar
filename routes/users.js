const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Datos de ejemplo de usuarios del sistema
let users = [
  {
    id: 'admin',
    nombre: 'Administrador del Sistema',
    email: 'admin@escuela.com',
    role: 'admin',
    activo: true,
    fechaCreacion: '2024-01-01'
  }
];

// GET /api/users - Obtener todos los usuarios
router.get('/', authMiddleware, (req, res) => {
  try {
    const { role, activo } = req.query;
    
    let filteredUsers = [...users];
    
    // Filtrar por rol
    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    }
    
    // Filtrar por estado activo
    if (activo !== undefined) {
      const isActive = activo === 'true';
      filteredUsers = filteredUsers.filter(u => u.activo === isActive);
    }
    
    // No devolver contraseñas
    const safeUsers = filteredUsers.map(({ password, ...user }) => user);
    
    res.json({
      success: true,
      count: safeUsers.length,
      data: safeUsers
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener usuarios',
      error: error.message 
    });
  }
});

// GET /api/users/:id - Obtener un usuario específico
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.params.id;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    // No devolver contraseña
    const { password, ...safeUser } = user;
    
    res.json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener usuario',
      error: error.message 
    });
  }
});

// POST /api/users - Crear nuevo usuario
router.post('/', authMiddleware, (req, res) => {
  try {
    const { id, nombre, email, password, role } = req.body;
    
    // Validaciones básicas
    if (!id || !nombre || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID, nombre, email y contraseña son requeridos' 
      });
    }
    
    // Verificar ID duplicado
    const idExists = users.some(u => u.id === id);
    if (idExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'El ID de usuario ya existe' 
      });
    }
    
    // Verificar email duplicado
    const emailExists = users.some(u => u.email === email);
    if (emailExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'El email ya está registrado' 
      });
    }
    
    // Crear nuevo usuario
    // NOTA: En producción, hashear la contraseña con bcrypt
    const newUser = {
      id,
      nombre,
      email,
      password, // En producción: await bcrypt.hash(password, 10)
      role: role || 'user',
      activo: true,
      fechaCreacion: new Date().toISOString().split('T')[0]
    };
    
    users.push(newUser);
    
    // No devolver contraseña en la respuesta
    const { password: _, ...safeUser } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear usuario',
      error: error.message 
    });
  }
});

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.params.id;
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    const { nombre, email, password, role, activo } = req.body;
    
    // Verificar email duplicado (excepto el propio)
    if (email && email !== users[userIndex].email) {
      const emailExists = users.some(u => u.email === email && u.id !== userId);
      if (emailExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'El email ya está registrado' 
        });
      }
    }
    
    // Actualizar campos
    users[userIndex] = {
      ...users[userIndex],
      nombre: nombre || users[userIndex].nombre,
      email: email || users[userIndex].email,
      password: password ? password : users[userIndex].password, // Hashear en producción
      role: role || users[userIndex].role,
      activo: activo !== undefined ? activo : users[userIndex].activo
    };
    
    // No devolver contraseña
    const { password: _, ...safeUser } = users[userIndex];
    
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar usuario',
      error: error.message 
    });
  }
});

// DELETE /api/users/:id - Desactivar usuario
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.params.id;
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    // No permitir desactivar el admin principal
    if (userId === 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'No se puede desactivar el usuario administrador principal' 
      });
    }
    
    // Desactivar usuario
    users[userIndex].activo = false;
    
    const { password: _, ...safeUser } = users[userIndex];
    
    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente',
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al desactivar usuario',
      error: error.message 
    });
  }
});

module.exports = router;
