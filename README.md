# API REST - Sistema de Gestión Escolar

API REST completa para el sistema de gestión escolar con autenticación JWT.

## 🚀 Características

- ✅ Autenticación con JWT
- ✅ CRUD completo de Estudiantes
- ✅ CRUD completo de Grupos
- ✅ CRUD completo de Inscripciones
- ✅ Gestión de Usuarios
- ✅ Filtros y búsquedas
- ✅ Estadísticas

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn

## 🔧 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
   - Copia el archivo `.env` y configura tus valores
   - **IMPORTANTE**: Cambia el `JWT_SECRET` en producción

3. Iniciar el servidor:
```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor se ejecutará en `http://localhost:3001`

## 🔐 Autenticación

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "id": "admin",
  "password": "admin123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin",
    "role": "admin",
    "name": "Administrador del Sistema"
  }
}
```

### Uso del Token

Incluye el token en todas las peticiones protegidas:
```bash
Authorization: Bearer TU_TOKEN_AQUI
```

## 📚 Endpoints

### Estudiantes

#### Listar todos los estudiantes
```bash
GET /api/students
Authorization: Bearer TOKEN

# Con filtros
GET /api/students?activo=true&search=juan
```

#### Obtener estudiante específico
```bash
GET /api/students/:id
Authorization: Bearer TOKEN
```

#### Crear estudiante
```bash
POST /api/students
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@email.com",
  "telefono": "555-0101",
  "fechaNacimiento": "2005-03-15",
  "direccion": "Calle Principal 123"
}
```

#### Actualizar estudiante
```bash
PUT /api/students/:id
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "nombre": "Juan Pérez Updated",
  "telefono": "555-0999"
}
```

#### Eliminar estudiante (soft delete)
```bash
DELETE /api/students/:id
Authorization: Bearer TOKEN
```

### Grupos

#### Listar todos los grupos
```bash
GET /api/groups
Authorization: Bearer TOKEN

# Con filtros
GET /api/groups?activo=true&disponible=true&search=matematicas
```

#### Obtener grupo específico
```bash
GET /api/groups/:id
Authorization: Bearer TOKEN
```

#### Crear grupo
```bash
POST /api/groups
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "nombre": "Matemáticas Avanzadas",
  "codigo": "MAT-ADV-2024",
  "descripcion": "Curso avanzado de matemáticas",
  "capacidadMaxima": 30,
  "profesor": "Dr. Carlos Rodríguez",
  "horario": "Lunes y Miércoles 10:00-12:00",
  "aula": "Aula 101",
  "fechaInicio": "2024-02-01",
  "fechaFin": "2024-06-30"
}
```

#### Verificar disponibilidad de cupos
```bash
GET /api/groups/:id/availability
Authorization: Bearer TOKEN
```

### Inscripciones

#### Listar inscripciones
```bash
GET /api/enrollments
Authorization: Bearer TOKEN

# Filtros disponibles
GET /api/enrollments?estudianteId=1
GET /api/enrollments?grupoId=2
GET /api/enrollments?estado=activo
```

#### Crear inscripción
```bash
POST /api/enrollments
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "estudianteId": 1,
  "grupoId": 2,
  "notas": "Inscripción regular"
}
```

#### Actualizar inscripción
```bash
PUT /api/enrollments/:id
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "estado": "completado",
  "calificacion": 95,
  "asistencia": 98
}
```

#### Estadísticas generales
```bash
GET /api/enrollments/stats/general
Authorization: Bearer TOKEN
```

### Usuarios

#### Listar usuarios
```bash
GET /api/users
Authorization: Bearer TOKEN
```

#### Crear usuario
```bash
POST /api/users
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "id": "profesor1",
  "nombre": "Carlos Rodríguez",
  "email": "carlos@escuela.com",
  "password": "password123",
  "role": "profesor"
}
```

## 🤖 Uso desde tu Chatbot

### Ejemplo en JavaScript/Node.js

```javascript
// 1. Login
async function login() {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      id: 'admin', 
      password: 'admin123' 
    })
  });
  const data = await response.json();
  return data.token;
}

// 2. Obtener estudiantes
async function getStudents(token) {
  const response = await fetch('http://localhost:3001/api/students', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
}

// 3. Crear inscripción
async function createEnrollment(token, estudianteId, grupoId) {
  const response = await fetch('http://localhost:3001/api/enrollments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ estudianteId, grupoId })
  });
  return await response.json();
}

// Uso
const token = await login();
const students = await getStudents(token);
console.log(students);
```

### Ejemplo en Python

```python
import requests

# 1. Login
def login():
    response = requests.post(
        'http://localhost:3001/api/auth/login',
        json={'id': 'admin', 'password': 'admin123'}
    )
    return response.json()['token']

# 2. Obtener estudiantes
def get_students(token):
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    response = requests.get(
        'http://localhost:3001/api/students',
        headers=headers
    )
    return response.json()

# Uso
token = login()
students = get_students(token)
print(students)
```

## 🔒 Seguridad

⚠️ **IMPORTANTE para Producción:**

1. **Cambia el JWT_SECRET** en el archivo `.env`
2. **Hashea las contraseñas** con bcrypt antes de guardarlas
3. **Usa HTTPS** en producción
4. **Configura CORS** apropiadamente
5. **Implementa rate limiting**
6. **Valida y sanitiza** todas las entradas
7. **Usa variables de entorno** para datos sensibles

## 📝 Estados de Inscripción

- `activo` - Inscripción activa
- `completado` - Curso completado
- `cancelado` - Inscripción cancelada
- `retirado` - Estudiante retirado del curso

## 🗄️ Próximos Pasos

Esta API actualmente usa datos en memoria. Para producción:

1. Integra una base de datos (PostgreSQL, MySQL, MongoDB)
2. Implementa migraciones de base de datos
3. Añade validaciones más robustas
4. Implementa paginación
5. Añade logs y monitoreo
6. Implementa tests unitarios

## 📄 Licencia

ISC
