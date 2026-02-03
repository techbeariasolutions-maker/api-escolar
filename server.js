const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initDB } = require('./db');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
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
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/students',    require('./routes/students'));
app.use('/api/groups',      require('./routes/groups'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/users',       require('./routes/users'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API del Sistema Escolar funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Error global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ── Arranque ──────────────────────────────────────────────────────────────
const port = process.env.PORT || 3001;

// Primero conectamos a la BD y sincronizamos tablas; solo entonces escuchamos.
initDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor API corriendo en puerto ${port}`);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`URL local: http://localhost:${port}`);
      }
      console.log('Health check disponible en /api/health');
    });
  })
  .catch((err) => {
    console.error('[DB] Error al conectar con la base de datos:', err);
    process.exit(1);   // Railway reinicia el container automáticamente
  });

module.exports = app;
