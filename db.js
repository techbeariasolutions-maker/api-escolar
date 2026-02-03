const { Sequelize, DataTypes } = require('sequelize');

// Conexión a PostgreSQL usando la variable de entorno DATABASE_URL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Modelo Student
const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  matricula: {
    type: DataTypes.STRING,
    unique: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  edad: {
    type: DataTypes.INTEGER
  },
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  telefono: {
    type: DataTypes.STRING
  },
  direccion: {
    type: DataTypes.STRING
  },
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'activo' // activo, suspendido, retirado
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'students',
  timestamps: true
});

// Modelo Group
const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  periodo: {
    type: DataTypes.STRING
  },
  profesor: {
    type: DataTypes.STRING
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  capacidadMaxima: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  estudiantesInscritos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'abierto' // abierto, cerrado
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'groups',
  timestamps: true
});

// Modelo Enrollment
const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  estudianteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Student,
      key: 'id'
    }
  },
  grupoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Group,
      key: 'id'
    }
  },
  fechaInscripcion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'inscrito' // inscrito, cursando, completado, cancelado
  },
  calificacion: {
    type: DataTypes.FLOAT
  },
  asistencia: {
    type: DataTypes.FLOAT
  }
}, {
  tableName: 'enrollments',
  timestamps: true
});

// Modelo User
const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  timestamps: true
});

// Relaciones
Student.hasMany(Enrollment, { foreignKey: 'estudianteId' });
Enrollment.belongsTo(Student, { foreignKey: 'estudianteId' });

Group.hasMany(Enrollment, { foreignKey: 'grupoId' });
Enrollment.belongsTo(Group, { foreignKey: 'grupoId' });

// Función para insertar datos iniciales del sistema escolar real
async function seedData() {
  try {
    const studentCount = await Student.count();
    
    if (studentCount === 0) {
      console.log('🌱 Insertando datos del sistema escolar...');
      
      // ========== ESTUDIANTES ==========
      const students = await Student.bulkCreate([
        {
          matricula: 'STU-000001',
          nombre: 'Alicia Jiménez',
          edad: 20,
          email: 'alicia@escuela.edu',
          telefono: '555-0001',
          direccion: 'Calle Principal 101',
          estado: 'activo',
          activo: true
        },
        {
          matricula: 'STU-000002',
          nombre: 'Roberto Sánchez',
          edad: 21,
          email: 'roberto@escuela.edu',
          telefono: '555-0002',
          direccion: 'Avenida Central 202',
          estado: 'activo',
          activo: true
        },
        {
          matricula: 'STU-000003',
          nombre: 'Carlos Moreno',
          edad: 19,
          email: 'carlos@escuela.edu',
          telefono: '555-0003',
          direccion: 'Boulevard Norte 303',
          estado: 'activo',
          activo: true
        },
        {
          matricula: 'STU-000004',
          nombre: 'Diana Príncipe',
          edad: 22,
          email: 'diana@escuela.edu',
          telefono: '555-0004',
          direccion: 'Calle Sur 404',
          estado: 'activo',
          activo: true
        },
        {
          matricula: 'STU-000005',
          nombre: 'Eduardo Navarro',
          edad: 20,
          email: 'eduardo@escuela.edu',
          telefono: '555-0005',
          direccion: 'Avenida Este 505',
          estado: 'activo',
          activo: true
        },
        {
          matricula: 'STU-000006',
          nombre: 'Fernanda Acosta',
          edad: 21,
          email: 'fernanda@escuela.edu',
          telefono: '555-0006',
          direccion: 'Calle Oeste 606',
          estado: 'activo',
          activo: true
        },
        {
          matricula: 'STU-000007',
          nombre: 'Gabriel Martínez',
          edad: 19,
          email: 'gabriel@escuela.edu',
          telefono: '555-0007',
          direccion: 'Boulevard Centro 707',
          estado: 'activo',
          activo: true
        },
        {
          matricula: 'STU-000008',
          nombre: 'Héctor Montes',
          edad: 22,
          email: 'hector@escuela.edu',
          telefono: '555-0008',
          direccion: 'Avenida Principal 808',
          estado: 'activo',
          activo: true
        },
        {
          matricula: 'STU-000009',
          nombre: 'Isabel Morales',
          edad: 20,
          email: 'isabel@escuela.edu',
          telefono: '555-0009',
          direccion: 'Calle Segunda 909',
          estado: 'suspendido',
          activo: true
        },
        {
          matricula: 'STU-000010',
          nombre: 'Juana Díaz',
          edad: 21,
          email: 'juana@escuela.edu',
          telefono: '555-0010',
          direccion: 'Boulevard Tercero 1010',
          estado: 'retirado',
          activo: false
        }
      ]);

      console.log(`✅ ${students.length} estudiantes creados`);

      // ========== GRUPOS ==========
      const groups = await Group.bulkCreate([
        {
          codigo: 'SUB-001-2024-1-A',
          nombre: 'Matemáticas I',
          periodo: '2024-1',
          profesor: 'Dr. Anderson',
          descripcion: 'Curso fundamental de matemáticas',
          capacidadMaxima: 30,
          estudiantesInscritos: 3,
          estado: 'abierto',
          activo: true
        },
        {
          codigo: 'SUB-002-2024-1-A',
          nombre: 'Programación',
          periodo: '2024-1',
          profesor: 'Prof. Williams',
          descripcion: 'Introducción a la programación',
          capacidadMaxima: 25,
          estudiantesInscritos: 4,
          estado: 'abierto',
          activo: true
        },
        {
          codigo: 'SUB-003-2024-1-A',
          nombre: 'Física',
          periodo: '2024-1',
          profesor: 'Dr. Martínez',
          descripcion: 'Física básica y aplicada',
          capacidadMaxima: 30,
          estudiantesInscritos: 2,
          estado: 'abierto',
          activo: true
        },
        {
          codigo: 'SUB-004-2024-1-A',
          nombre: 'Historia',
          periodo: '2024-1',
          profesor: 'Prof. Davis',
          descripcion: 'Historia universal',
          capacidadMaxima: 35,
          estudiantesInscritos: 3,
          estado: 'abierto',
          activo: true
        },
        {
          codigo: 'SUB-005-2024-1-A',
          nombre: 'Inglés',
          periodo: '2024-1',
          profesor: 'Dr. Thompson',
          descripcion: 'Inglés intermedio',
          capacidadMaxima: 28,
          estudiantesInscritos: 3,
          estado: 'abierto',
          activo: true
        },
        {
          codigo: 'SUB-001-2024-1-B',
          nombre: 'Matemáticas I',
          periodo: '2024-1',
          profesor: 'Dr. Wilson',
          descripcion: 'Curso fundamental de matemáticas - Grupo B',
          capacidadMaxima: 30,
          estudiantesInscritos: 0,
          estado: 'abierto',
          activo: true
        },
        {
          codigo: 'SUB-002-2024-1-B',
          nombre: 'Programación',
          periodo: '2024-1',
          profesor: 'Prof. García',
          descripcion: 'Introducción a la programación - Grupo B',
          capacidadMaxima: 25,
          estudiantesInscritos: 0,
          estado: 'cerrado',
          activo: true
        }
      ]);

      console.log(`✅ ${groups.length} grupos creados`);

      // ========== INSCRIPCIONES ==========
      const enrollments = await Enrollment.bulkCreate([
        // Alicia Jiménez (STU-000001)
        { estudianteId: students[0].id, grupoId: groups[0].id, fechaInscripcion: '2024-02-01', estado: 'inscrito', asistencia: null, calificacion: null },
        { estudianteId: students[0].id, grupoId: groups[1].id, fechaInscripcion: '2024-02-01', estado: 'inscrito', asistencia: null, calificacion: null },
        
        // Roberto Sánchez (STU-000002)
        { estudianteId: students[1].id, grupoId: groups[0].id, fechaInscripcion: '2024-01-29', estado: 'inscrito', asistencia: null, calificacion: null },
        { estudianteId: students[1].id, grupoId: groups[1].id, fechaInscripcion: '2024-01-29', estado: 'inscrito', asistencia: null, calificacion: null },
        
        // Carlos Moreno (STU-000003)
        { estudianteId: students[2].id, grupoId: groups[0].id, fechaInscripcion: '2024-01-30', estado: 'inscrito', asistencia: null, calificacion: null },
        { estudianteId: students[2].id, grupoId: groups[2].id, fechaInscripcion: '2024-01-30', estado: 'inscrito', asistencia: null, calificacion: null },
        
        // Diana Príncipe (STU-000004)
        { estudianteId: students[3].id, grupoId: groups[2].id, fechaInscripcion: '2024-01-28', estado: 'inscrito', asistencia: null, calificacion: null },
        { estudianteId: students[3].id, grupoId: groups[3].id, fechaInscripcion: '2024-01-28', estado: 'inscrito', asistencia: null, calificacion: null },
        
        // Eduardo Navarro (STU-000005)
        { estudianteId: students[4].id, grupoId: groups[1].id, fechaInscripcion: '2024-02-02', estado: 'inscrito', asistencia: null, calificacion: null },
        { estudianteId: students[4].id, grupoId: groups[3].id, fechaInscripcion: '2024-02-02', estado: 'inscrito', asistencia: null, calificacion: null },
        
        // Fernanda Acosta (STU-000006)
        { estudianteId: students[5].id, grupoId: groups[3].id, fechaInscripcion: '2024-01-27', estado: 'inscrito', asistencia: null, calificacion: null },
        { estudianteId: students[5].id, grupoId: groups[4].id, fechaInscripcion: '2024-01-27', estado: 'inscrito', asistencia: null, calificacion: null },
        
        // Gabriel Martínez (STU-000007)
        { estudianteId: students[6].id, grupoId: groups[1].id, fechaInscripcion: '2024-02-03', estado: 'inscrito', asistencia: null, calificacion: null },
        { estudianteId: students[6].id, grupoId: groups[4].id, fechaInscripcion: '2024-02-03', estado: 'inscrito', asistencia: null, calificacion: null },
        
        // Héctor Montes (STU-000008)
        { estudianteId: students[7].id, grupoId: groups[4].id, fechaInscripcion: '2024-01-31', estado: 'inscrito', asistencia: null, calificacion: null }
      ]);

      console.log(`✅ ${enrollments.length} inscripciones creadas`);

      // ========== USUARIO ADMIN ==========
      await User.create({
        id: 'admin',
        nombre: 'Administrador del Sistema',
        password: 'admin123',
        email: 'admin@escuela.edu',
        role: 'admin',
        activo: true
      });

      console.log('✅ Usuario admin creado');
      console.log('🎉 Datos del sistema escolar cargados correctamente');
      
    } else {
      console.log('ℹ️  La base de datos ya contiene datos. Omitiendo seed.');
    }
  } catch (error) {
    console.error('❌ Error al insertar datos:', error);
    throw error;
  }
}

// Función para BORRAR TODOS los datos (usar con precaución)
async function clearAllData() {
  try {
    console.log('🗑️  Borrando todos los datos...');
    
    await Enrollment.destroy({ where: {}, truncate: true });
    console.log('✅ Inscripciones borradas');
    
    await Student.destroy({ where: {}, truncate: true });
    console.log('✅ Estudiantes borrados');
    
    await Group.destroy({ where: {}, truncate: true });
    console.log('✅ Grupos borrados');
    
    await User.destroy({ where: {}, truncate: true });
    console.log('✅ Usuarios borrados');
    
    console.log('🎯 Base de datos limpia');
  } catch (error) {
    console.error('❌ Error al borrar datos:', error);
    throw error;
  }
}

// Función para resetear y recargar datos
async function resetDatabase() {
  try {
    console.log('🔄 Reseteando base de datos...');
    await clearAllData();
    await seedData();
    console.log('✅ Base de datos reseteada correctamente');
  } catch (error) {
    console.error('❌ Error al resetear:', error);
    throw error;
  }
}

// Función para inicializar la base de datos
async function initDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');

    await sequelize.sync({ alter: false });
    console.log('✅ Modelos sincronizados con la base de datos');

    await seedData();

  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  Student,
  Group,
  Enrollment,
  User,
  initDB,
  resetDatabase,
  clearAllData
};
