const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Datos de ejemplo de grupos
let groups = [
  {
    id: 1,
    nombre: 'Grupo A - Matemáticas Avanzadas',
    codigo: 'MAT-ADV-2024-1',
    descripcion: 'Curso avanzado de matemáticas para estudiantes de último año',
    capacidadMaxima: 30,
    estudiantesInscritos: 25,
    profesor: 'Dr. Carlos Rodríguez',
    horario: 'Lunes y Miércoles 10:00-12:00',
    aula: 'Aula 101',
    activo: true,
    fechaInicio: '2024-02-01',
    fechaFin: '2024-06-30'
  },
  {
    id: 2,
    nombre: 'Grupo B - Programación Web',
    codigo: 'PROG-WEB-2024-1',
    descripcion: 'Desarrollo de aplicaciones web modernas con JavaScript',
    capacidadMaxima: 25,
    estudiantesInscritos: 20,
    profesor: 'Ing. Ana Martínez',
    horario: 'Martes y Jueves 14:00-16:00',
    aula: 'Lab. Computación 2',
    activo: true,
    fechaInicio: '2024-02-01',
    fechaFin: '2024-06-30'
  }
];

// GET /api/groups - Obtener todos los grupos
router.get('/', authMiddleware, (req, res) => {
  try {
    const { activo, disponible, search } = req.query;
    
    let filteredGroups = [...groups];
    
    // Filtrar por estado activo
    if (activo !== undefined) {
      const isActive = activo === 'true';
      filteredGroups = filteredGroups.filter(g => g.activo === isActive);
    }
    
    // Filtrar grupos con cupos disponibles
    if (disponible === 'true') {
      filteredGroups = filteredGroups.filter(g => 
        g.estudiantesInscritos < g.capacidadMaxima
      );
    }
    
    // Buscar por nombre o código
    if (search) {
      const searchLower = search.toLowerCase();
      filteredGroups = filteredGroups.filter(g => 
        g.nombre.toLowerCase().includes(searchLower) ||
        g.codigo.toLowerCase().includes(searchLower) ||
        g.profesor.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({
      success: true,
      count: filteredGroups.length,
      data: filteredGroups
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener grupos',
      error: error.message 
    });
  }
});

// GET /api/groups/:id - Obtener un grupo específico
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const group = groups.find(g => g.id === groupId);
    
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Grupo no encontrado' 
      });
    }
    
    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener grupo',
      error: error.message 
    });
  }
});

// POST /api/groups - Crear nuevo grupo
router.post('/', authMiddleware, (req, res) => {
  try {
    const { 
      nombre, 
      codigo, 
      descripcion, 
      capacidadMaxima, 
      profesor, 
      horario, 
      aula,
      fechaInicio,
      fechaFin 
    } = req.body;
    
    // Validaciones básicas
    if (!nombre || !codigo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre y código son requeridos' 
      });
    }
    
    // Verificar código duplicado
    const codigoExists = groups.some(g => g.codigo === codigo);
    if (codigoExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'El código del grupo ya existe' 
      });
    }
    
    // Crear nuevo grupo
    const newGroup = {
      id: groups.length > 0 ? Math.max(...groups.map(g => g.id)) + 1 : 1,
      nombre,
      codigo,
      descripcion: descripcion || '',
      capacidadMaxima: capacidadMaxima || 30,
      estudiantesInscritos: 0,
      profesor: profesor || '',
      horario: horario || '',
      aula: aula || '',
      activo: true,
      fechaInicio: fechaInicio || '',
      fechaFin: fechaFin || ''
    };
    
    groups.push(newGroup);
    
    res.status(201).json({
      success: true,
      message: 'Grupo creado exitosamente',
      data: newGroup
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear grupo',
      error: error.message 
    });
  }
});

// PUT /api/groups/:id - Actualizar grupo
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const groupIndex = groups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Grupo no encontrado' 
      });
    }
    
    const updateData = req.body;
    
    // Verificar código duplicado (excepto el propio)
    if (updateData.codigo && updateData.codigo !== groups[groupIndex].codigo) {
      const codigoExists = groups.some(g => g.codigo === updateData.codigo && g.id !== groupId);
      if (codigoExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'El código del grupo ya existe' 
        });
      }
    }
    
    // Actualizar campos
    groups[groupIndex] = {
      ...groups[groupIndex],
      ...updateData,
      id: groupId // Asegurar que el ID no cambie
    };
    
    res.json({
      success: true,
      message: 'Grupo actualizado exitosamente',
      data: groups[groupIndex]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar grupo',
      error: error.message 
    });
  }
});

// DELETE /api/groups/:id - Eliminar grupo (soft delete)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const groupIndex = groups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Grupo no encontrado' 
      });
    }
    
    // Soft delete - marcar como inactivo
    groups[groupIndex].activo = false;
    
    res.json({
      success: true,
      message: 'Grupo desactivado exitosamente',
      data: groups[groupIndex]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar grupo',
      error: error.message 
    });
  }
});

// GET /api/groups/:id/availability - Verificar disponibilidad de cupos
router.get('/:id/availability', authMiddleware, (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const group = groups.find(g => g.id === groupId);
    
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Grupo no encontrado' 
      });
    }
    
    const cuposDisponibles = group.capacidadMaxima - group.estudiantesInscritos;
    const disponible = cuposDisponibles > 0 && group.activo;
    
    res.json({
      success: true,
      data: {
        grupoId: group.id,
        nombre: group.nombre,
        capacidadMaxima: group.capacidadMaxima,
        estudiantesInscritos: group.estudiantesInscritos,
        cuposDisponibles: cuposDisponibles,
        disponible: disponible,
        porcentajeOcupacion: ((group.estudiantesInscritos / group.capacidadMaxima) * 100).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al verificar disponibilidad',
      error: error.message 
    });
  }
});

module.exports = router;
