const jwt = require('jsonwebtoken');

// Middleware para verificar el token JWT
const authMiddleware = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'Acceso denegado. No se proporcionó token de autenticación.' 
      });
    }

    // El formato debe ser: "Bearer TOKEN"
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token no válido.' 
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_default');
    
    // Agregar la información del usuario al request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expirado. Por favor, inicia sesión nuevamente.' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Token no válido.' 
    });
  }
};

// Middleware opcional - no requiere autenticación obligatoria
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_default');
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Si hay error en el token opcional, simplemente continuamos sin usuario
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuth
};
