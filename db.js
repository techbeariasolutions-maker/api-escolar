const { Sequelize, DataTypes } = require('sequelize');

// Conexión a PostgreSQL usando la variable de entorno DATABASE_URL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Cambia a console.log si quieres ver las consultas SQL
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
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
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
    defaultValue: 'activo'
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

// Función para insertar datos iniciales
async function seedData() {
  try {
    // Verificar si ya hay datos
    const studentCount = await Student.count();
    
    if (studentCount === 0) {
      console.log('Insertando datos iniciales...');
      
      // Crear estudiantes
      const student1 = await Student.create({
        nombre: 'Juan Pérez',
        edad: 20,
        email: 'juan.perez@email.com',
        telefono: '555-0101',
        direccion: 'Calle Principal 123',
        activo: true
      });

      const student2 = await Student.create({
        nombre: 'María García',
        edad: 22,
        email: 'maria.garcia@email.com',
        telefono: '555-0102',
        direccion: 'Avenida Central 456',
        activo: true
      });

      // Crear grupos
      const group1 = await Group.create({
        nombre: 'Grupo A - Matemáticas Avanzadas',
        codigo: 'MAT-ADV-2024-1',
        descripcion: 'Curso avanzado de matemáticas para estudiantes de ingeniería',
        capacidadMaxima: 30,
        estudiantesInscritos: 2,
        activo: true
      });

      const group2 = await Group.create({
        nombre: 'Grupo B - Programación Web',
        codigo: 'PROG-WEB-2024-1',
        descripcion: 'Introducción al desarrollo web moderno con JavaScript',
        capacidadMaxima: 25,
        estudiantesInscritos: 1,
        activo: true
      });

      // Crear inscripciones
      await Enrollment.create({
        estudianteId: student1.id,
        grupoId: group1.id,
        estado: 'activo',
        asistencia: 95,
        calificacion: null
      });

      await Enrollment.create({
        estudianteId: student2.id,
        grupoId: group1.id,
        estado: 'activo',
        asistencia: 88,
        calificacion: null
      });

      await Enrollment.create({
        estudianteId: student1.id,
        grupoId: group2.id,
        estado: 'activo',
        asistencia: 92,
        calificacion: null
      });

      // Crear usuario admin
      await User.create({
        id: 'admin',
        nombre: 'Administrador del Sistema',
        password: 'admin123', // En producción debería estar hasheado con bcrypt
        email: 'admin@sistema.com',
        role: 'admin',
        activo: true
      });

      console.log('✅ Datos iniciales insertados correctamente');
    } else {
      console.log('ℹ️  La base de datos ya contiene datos. Omitiendo seed.');
    }
  } catch (error) {
    console.error('❌ Error al insertar datos iniciales:', error);
  }
}

// Función para inicializar la base de datos
async function initDB() {
  try {
    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');

    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync({ alter: false }); // alter: true modificaría las tablas existentes
    console.log('✅ Modelos sincronizados con la base de datos');

    // Insertar datos iniciales
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
  initDB
};
