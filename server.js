const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // En producción, especifica los dominios permitidos
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requests para debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas de la API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/users', require('./routes/users'));

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API del Sistema Escolar funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Ruta no encontrada' 
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Versión corregida para Railway (puerto dinámico)
const port = process.env.PORT || 3001;  // Railway asigna PORT automáticamente

app.listen(port, () => {
  console.log(`Servidor API corriendo en puerto ${port}`);

  // Solo muestra localhost en desarrollo (local), no en producción
  if (process.env.NODE_ENV !== 'production') {
    console.log(`URL local: http://localhost:${port}`);
  }

  console.log(`Health check disponible en /api/health`);
});

module.exports = app;
