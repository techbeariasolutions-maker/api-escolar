# Colección de Ejemplos API - Sistema Escolar

## Variables de entorno
```
BASE_URL: http://localhost:3001
TOKEN: (se obtiene después del login)
```

---

## 1. AUTENTICACIÓN

### Login
```http
POST {{BASE_URL}}/api/auth/login
Content-Type: application/json

{
  "id": "admin",
  "password": "admin123"
}
```

### Verificar Token
```http
POST {{BASE_URL}}/api/auth/verify
Content-Type: application/json

{
  "token": "{{TOKEN}}"
}
```

---

## 2. ESTUDIANTES

### Listar todos
```http
GET {{BASE_URL}}/api/students
Authorization: Bearer {{TOKEN}}
```

### Buscar estudiantes
```http
GET {{BASE_URL}}/api/students?search=juan&activo=true
Authorization: Bearer {{TOKEN}}
```

### Obtener por ID
```http
GET {{BASE_URL}}/api/students/1
Authorization: Bearer {{TOKEN}}
```

### Crear estudiante
```http
POST {{BASE_URL}}/api/students
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "nombre": "Pedro López",
  "email": "pedro.lopez@email.com",
  "telefono": "555-0103",
  "fechaNacimiento": "2006-05-20",
  "direccion": "Avenida Reforma 789"
}
```

### Actualizar estudiante
```http
PUT {{BASE_URL}}/api/students/1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "telefono": "555-9999",
  "direccion": "Nueva dirección 456"
}
```

### Eliminar estudiante
```http
DELETE {{BASE_URL}}/api/students/1
Authorization: Bearer {{TOKEN}}
```

---

## 3. GRUPOS

### Listar todos
```http
GET {{BASE_URL}}/api/groups
Authorization: Bearer {{TOKEN}}
```

### Buscar grupos disponibles
```http
GET {{BASE_URL}}/api/groups?disponible=true&activo=true
Authorization: Bearer {{TOKEN}}
```

### Obtener por ID
```http
GET {{BASE_URL}}/api/groups/1
Authorization: Bearer {{TOKEN}}
```

### Verificar disponibilidad
```http
GET {{BASE_URL}}/api/groups/1/availability
Authorization: Bearer {{TOKEN}}
```

### Crear grupo
```http
POST {{BASE_URL}}/api/groups
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "nombre": "Historia Universal",
  "codigo": "HIST-UNI-2024",
  "descripcion": "Curso de historia desde la antigüedad hasta la época moderna",
  "capacidadMaxima": 35,
  "profesor": "Lic. Laura Mendoza",
  "horario": "Viernes 9:00-11:00",
  "aula": "Aula 205",
  "fechaInicio": "2024-02-01",
  "fechaFin": "2024-06-30"
}
```

### Actualizar grupo
```http
PUT {{BASE_URL}}/api/groups/1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "capacidadMaxima": 32,
  "aula": "Aula 102"
}
```

### Eliminar grupo
```http
DELETE {{BASE_URL}}/api/groups/1
Authorization: Bearer {{TOKEN}}
```

---

## 4. INSCRIPCIONES

### Listar todas
```http
GET {{BASE_URL}}/api/enrollments
Authorization: Bearer {{TOKEN}}
```

### Filtrar por estudiante
```http
GET {{BASE_URL}}/api/enrollments?estudianteId=1
Authorization: Bearer {{TOKEN}}
```

### Filtrar por grupo
```http
GET {{BASE_URL}}/api/enrollments?grupoId=2
Authorization: Bearer {{TOKEN}}
```

### Filtrar por estado
```http
GET {{BASE_URL}}/api/enrollments?estado=activo
Authorization: Bearer {{TOKEN}}
```

### Inscripciones de un estudiante
```http
GET {{BASE_URL}}/api/enrollments/student/1
Authorization: Bearer {{TOKEN}}
```

### Inscripciones de un grupo
```http
GET {{BASE_URL}}/api/enrollments/group/1
Authorization: Bearer {{TOKEN}}
```

### Estadísticas
```http
GET {{BASE_URL}}/api/enrollments/stats/general
Authorization: Bearer {{TOKEN}}
```

### Crear inscripción
```http
POST {{BASE_URL}}/api/enrollments
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "estudianteId": 1,
  "grupoId": 2,
  "notas": "Inscripción regular del semestre"
}
```

### Actualizar inscripción
```http
PUT {{BASE_URL}}/api/enrollments/1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "estado": "activo",
  "calificacion": 88,
  "asistencia": 92,
  "notas": "Buen desempeño"
}
```

### Cancelar inscripción
```http
DELETE {{BASE_URL}}/api/enrollments/1
Authorization: Bearer {{TOKEN}}
```

---

## 5. USUARIOS

### Listar todos
```http
GET {{BASE_URL}}/api/users
Authorization: Bearer {{TOKEN}}
```

### Filtrar por rol
```http
GET {{BASE_URL}}/api/users?role=profesor
Authorization: Bearer {{TOKEN}}
```

### Obtener por ID
```http
GET {{BASE_URL}}/api/users/admin
Authorization: Bearer {{TOKEN}}
```

### Crear usuario
```http
POST {{BASE_URL}}/api/users
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "id": "profesor1",
  "nombre": "Carlos Rodríguez",
  "email": "carlos@escuela.com",
  "password": "profesor123",
  "role": "profesor"
}
```

### Actualizar usuario
```http
PUT {{BASE_URL}}/api/users/profesor1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "nombre": "Carlos Rodríguez PhD",
  "email": "carlos.rodriguez@escuela.com"
}
```

### Desactivar usuario
```http
DELETE {{BASE_URL}}/api/users/profesor1
Authorization: Bearer {{TOKEN}}
```

---

## 6. HEALTH CHECK

### Verificar estado del servidor
```http
GET {{BASE_URL}}/api/health
```

---

## Notas:

1. Reemplaza `{{BASE_URL}}` con `http://localhost:3001`
2. Reemplaza `{{TOKEN}}` con el token que obtienes del login
3. El token expira en 24 horas
4. Todos los endpoints (excepto login y health) requieren autenticación
