const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// POST /api/auth/login - Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Por favor proporciona ID y contraseña' 
      });
    }

    // TEMPORAL: Validación simple (en producción usa bcrypt y base de datos)
    if (id === 'admin' && password === 'admin123') {
      const token = jwt.sign(
        { 
          userId: id, 
          role: 'admin',
          name: 'Administrador del Sistema'
        },
        process.env.JWT_SECRET || 'secret_key_default',
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        token: token,
        user: {
          id: id,
          role: 'admin',
          name: 'Administrador del Sistema'
        }
      });
    }

    return res.status(401).json({ 
      success: false, 
      message: 'Credenciales inválidas' 
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al iniciar sesión',
      error: error.message 
    });
  }
});

// POST /api/auth/verify - Verificar si un token es válido
router.post('/verify', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se proporcionó token' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_default');
    
    res.json({
      success: true,
      valid: true,
      user: decoded
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      valid: false,
      message: 'Token inválido o expirado'
    });
  }
});

// POST /api/auth/refresh - Renovar token
router.post('/refresh', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se proporcionó token' 
      });
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'secret_key_default',
      { ignoreExpiration: true }
    );
    
    const newToken = jwt.sign(
      { 
        userId: decoded.userId, 
        role: decoded.role,
        name: decoded.name
      },
      process.env.JWT_SECRET || 'secret_key_default',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token: newToken
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'No se pudo renovar el token'
    });
  }
});

module.exports = router;
