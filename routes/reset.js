const express = require('express');
const router = express.Router();
const { resetDatabase, clearAllData } = require('../db');

// Endpoint para resetear completamente la base de datos
// ⚠️ PELIGROSO - Solo para desarrollo
router.post('/reset', async (req, res) => {
  try {
    await resetDatabase();
    res.json({
      success: true,
      message: 'Base de datos reseteada correctamente. Todos los datos antiguos fueron eliminados y se cargaron los datos del sistema escolar.'
    });
  } catch (error) {
    console.error('Error al resetear:', error);
    res.status(500).json({
      success: false,
      message: 'Error al resetear la base de datos',
      error: error.message
    });
  }
});

// Endpoint para solo borrar datos (sin recargar)
router.post('/clear', async (req, res) => {
  try {
    await clearAllData();
    res.json({
      success: true,
      message: 'Todos los datos fueron eliminados'
    });
  } catch (error) {
    console.error('Error al limpiar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar la base de datos',
      error: error.message
    });
  }
});

module.exports = router;
