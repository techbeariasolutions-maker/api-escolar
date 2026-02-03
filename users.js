const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authMiddleware } = require('../middleware/auth');
const { User } = require('../db');

// helper: strip password before sending
function safeUser(u) {
  const obj = u.toJSON ? u.toJSON() : { ...u };
  delete obj.password;
  return obj;
}

// GET /api/users
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role, activo } = req.query;
    const where = {};

    if (role)   where.role   = role;
    if (activo !== undefined) where.activo = activo === 'true';

    const users = await User.findAll({ where, attributes: { exclude: ['password'] } });

    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener usuarios', error: error.message });
  }
});

// GET /api/users/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener usuario', error: error.message });
  }
});

// POST /api/users
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { id, nombre, email, password, role } = req.body;

    if (!id || !nombre || !email || !password) {
      return res.status(400).json({ success: false, message: 'ID, nombre, email y contraseña son requeridos' });
    }

    // ID único
    const idExists = await User.findByPk(id);
    if (idExists) {
      return res.status(400).json({ success: false, message: 'El ID de usuario ya existe' });
    }

    // Email único
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    const newUser = await User.create({
      id,
      nombre,
      email,
      password,   // TODO producción: await bcrypt.hash(password, 10)
      role:          role || 'user',
      fechaCreacion: new Date().toISOString().split('T')[0]
    });

    res.status(201).json({ success: true, message: 'Usuario creado exitosamente', data: safeUser(newUser) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear usuario', error: error.message });
  }
});

// PUT /api/users/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const { nombre, email, password, role, activo } = req.body;

    // Email único (excepto el propio)
    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email, id: { [Op.ne]: userId } } });
      if (exists) {
        return res.status(400).json({ success: false, message: 'El email ya está registrado' });
      }
    }

    await user.update({
      nombre:   nombre   || user.nombre,
      email:    email    || user.email,
      password: password ? password : user.password,   // hashear en producción
      role:     role     || user.role,
      activo:   activo   !== undefined ? activo : user.activo
    });

    res.json({ success: true, message: 'Usuario actualizado exitosamente', data: safeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar usuario', error: error.message });
  }
});

// DELETE /api/users/:id  — desactivar (no se puede desactivar admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId === 'admin') {
      return res.status(403).json({ success: false, message: 'No se puede desactivar el usuario administrador principal' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    await user.update({ activo: false });

    res.json({ success: true, message: 'Usuario desactivado exitosamente', data: safeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al desactivar usuario', error: error.message });
  }
});

module.exports = router;
