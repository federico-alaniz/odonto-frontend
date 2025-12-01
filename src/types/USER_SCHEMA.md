# Esquema de Usuario - Documentación

## Interfaces TypeScript

### `User` - Objeto completo del usuario
Interfaz principal que representa un usuario en el sistema con todos sus datos.

### `UserFormData` - Datos del formulario
Interfaz para crear/actualizar usuarios (sin campos autogenerados como `id`, `createdAt`, etc.)

### `HorarioAtencion` - Horarios de atención (doctores)
Interfaz para los horarios de atención de los médicos.

---

## Ejemplo de Usuario Doctor

```json
{
  "id": "usr_123456",
  "clinicId": "clinic_001",
  "nombres": "Juan Carlos",
  "apellidos": "Pérez González",
  "name": "Juan Carlos Pérez González",
  "tipoDocumento": "DNI",
  "numeroDocumento": "12345678",
  "fechaNacimiento": "1985-05-15",
  "genero": "masculino",
  "avatar": "https://example.com/avatars/jperez.jpg",
  
  "email": "jperez@medicore.com.ar",
  "telefono": "+54 11 4567-8900",
  "direccion": "Av. Corrientes 1234",
  "ciudad": "Buenos Aires",
  "provincia": "Buenos Aires",
  "codigoPostal": "1043",
  
  "role": "doctor",
  "estado": "activo",
  "isActive": true,
  "permissions": [
    {
      "resource": "patients",
      "actions": ["create", "read", "update"],
      "scope": "own"
    },
    {
      "resource": "consultations",
      "actions": ["create", "read", "update"],
      "scope": "own"
    }
  ],
  "lastLogin": "2025-11-05T14:30:00Z",
  
  "createdAt": "2025-01-15T10:30:00Z",
  "createdBy": "usr_000001",
  "updatedAt": "2025-11-05T14:30:00Z",
  "updatedBy": "usr_000001",
  
  "especialidades": ["1", "3"],
  "consultorio": "101",
  "matricula": "MN 12345",
  "horariosAtencion": [
    { "dia": 1, "activo": true, "horaInicio": "08:00", "horaFin": "18:00" },
    { "dia": 2, "activo": true, "horaInicio": "08:00", "horaFin": "18:00" },
    { "dia": 3, "activo": true, "horaInicio": "08:00", "horaFin": "14:00" },
    { "dia": 4, "activo": false, "horaInicio": "08:00", "horaFin": "18:00" },
    { "dia": 5, "activo": true, "horaInicio": "08:00", "horaFin": "18:00" },
    { "dia": 6, "activo": false, "horaInicio": "08:00", "horaFin": "18:00" }
  ]
}
```

---

## Ejemplo de Usuario Secretaria

```json
{
  "id": "usr_789012",
  "clinicId": "clinic_001",
  "nombres": "María Laura",
  "apellidos": "Fernández",
  "name": "María Laura Fernández",
  "tipoDocumento": "DNI",
  "numeroDocumento": "87654321",
  "fechaNacimiento": "1992-08-20",
  "genero": "femenino",
  
  "email": "mfernandez@medicore.com.ar",
  "telefono": "+54 11 4567-8901",
  "direccion": "Av. Santa Fe 5678",
  "ciudad": "Buenos Aires",
  "provincia": "Buenos Aires",
  "codigoPostal": "1425",
  
  "role": "secretary",
  "estado": "activo",
  "isActive": true,
  "permissions": [
    {
      "resource": "appointments",
      "actions": ["create", "read", "update"],
      "scope": "all"
    },
    {
      "resource": "patients",
      "actions": ["create", "read", "update"],
      "scope": "all"
    }
  ],
  "lastLogin": "2025-11-05T08:00:00Z",
  
  "createdAt": "2025-02-01T09:00:00Z",
  "createdBy": "usr_000001",
  "updatedAt": "2025-11-05T08:00:00Z",
  "updatedBy": "usr_123456",
  
  "turno": "mañana",
  "area": "recepción"
}
```

---

## Ejemplo de Usuario Admin

```json
{
  "id": "usr_000001",
  "clinicId": "clinic_001",
  "nombres": "Carlos Alberto",
  "apellidos": "Rodríguez",
  "name": "Carlos Alberto Rodríguez",
  "tipoDocumento": "DNI",
  "numeroDocumento": "11223344",
  "fechaNacimiento": "1980-03-10",
  "genero": "masculino",
  
  "email": "admin@medicore.com.ar",
  "telefono": "+54 11 4567-8888",
  "direccion": "Av. Rivadavia 9999",
  "ciudad": "Buenos Aires",
  "provincia": "Buenos Aires",
  "codigoPostal": "1406",
  
  "role": "admin",
  "estado": "activo",
  "isActive": true,
  "permissions": [
    {
      "resource": "*",
      "actions": ["create", "read", "update", "delete"],
      "scope": "all"
    }
  ],
  "lastLogin": "2025-11-05T16:00:00Z",
  
  "createdAt": "2025-01-01T00:00:00Z",
  "createdBy": "system",
  "updatedAt": "2025-11-05T16:00:00Z",
  "updatedBy": "usr_000001"
}
```

---

## Multi-Tenancy

El sistema soporta múltiples clínicas (multi-tenancy) mediante el campo `clinicId`.

### Características

1. **Aislamiento de Datos:**
   - Cada usuario pertenece a una única clínica (`clinicId`)
   - Los usuarios solo pueden ver/modificar datos de su propia clínica
   - Las consultas a la base de datos deben filtrar siempre por `clinicId`

2. **Asignación Automática:**
   - Al crear un usuario, el `clinicId` se asigna automáticamente desde el usuario autenticado
   - Un admin puede crear usuarios solo para su propia clínica
   - Super admins (si existen) pueden gestionar múltiples clínicas

3. **Validaciones:**
   - Todas las operaciones deben validar que el usuario tiene acceso a la clínica
   - No se permite acceso cross-clinic sin permisos especiales
   - Los IDs de recursos (especialidades, consultorios) deben pertenecer a la misma clínica

### Ejemplo de Filtrado por Clínica

```typescript
// Backend - Middleware de multi-tenancy
app.use((req, res, next) => {
  // Obtener clinicId del usuario autenticado
  req.clinicId = req.user.clinicId;
  next();
});

// Todas las consultas filtran por clinicId
const users = await User.find({ clinicId: req.clinicId });
const patients = await Patient.find({ clinicId: req.clinicId });
```

### Estructura de Clínica

```json
{
  "id": "clinic_001",
  "name": "Centro Médico MediCore",
  "subdomain": "medicore",
  "plan": "premium",
  "maxUsers": 50,
  "maxPatients": 1000,
  "features": ["telemedicine", "lab_integration", "billing"],
  "settings": {
    "timezone": "America/Argentina/Buenos_Aires",
    "language": "es",
    "currency": "ARS"
  },
  "createdAt": "2025-01-01T00:00:00Z",
  "isActive": true
}
```

---

## Endpoints de API Esperados

### `POST /api/users`
Crear nuevo usuario.

**Request Body:**
```json
{
  "nombres": "Juan Carlos",
  "apellidos": "Pérez González",
  "tipoDocumento": "DNI",
  "numeroDocumento": "12345678",
  "fechaNacimiento": "1985-05-15",
  "genero": "masculino",
  "email": "jperez@medicore.com.ar",
  "telefono": "+54 11 4567-8900",
  "direccion": "Av. Corrientes 1234",
  "ciudad": "Buenos Aires",
  "provincia": "Buenos Aires",
  "codigoPostal": "1043",
  "role": "doctor",
  "password": "SecurePassword123!",
  "estado": "activo",
  "especialidades": ["1", "3"],
  "consultorio": "101",
  "matricula": "MN 12345",
  "horariosAtencion": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "usr_123456",
    "nombres": "Juan Carlos",
    "apellidos": "Pérez González",
    ...
  },
  "message": "Usuario creado exitosamente"
}
```

### `GET /api/users`
Obtener lista de usuarios.

**Query Parameters:**
- `role` (optional): Filtrar por rol
- `estado` (optional): Filtrar por estado
- `page` (optional): Número de página
- `limit` (optional): Cantidad por página

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "usr_123456", ... },
    { "id": "usr_789012", ... }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### `GET /api/users/:id`
Obtener un usuario específico.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "usr_123456",
    "nombres": "Juan Carlos",
    ...
  }
}
```

### `PUT /api/users/:id`
Actualizar usuario.

**Request Body:** (UserFormData sin password)
```json
{
  "nombres": "Juan Carlos",
  "apellidos": "Pérez González",
  ...
}
```

### `DELETE /api/users/:id`
Eliminar usuario (soft delete).

**Response:**
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

---

## Campos Específicos por Rol

### Doctor
- `especialidades`: Array de IDs de especialidades (configuradas en `/admin/settings`)
- `consultorio`: ID del consultorio asignado
- `matricula`: Número de matrícula profesional
- `horariosAtencion`: Array de horarios por día de la semana

### Secretaria
- `turno`: 'mañana' | 'tarde' | 'noche' | 'completo'
- `area`: Área de trabajo (ej: 'recepción', 'administración')

### Admin
- No tiene campos específicos adicionales
- Tiene permisos completos sobre todos los recursos

---

## Campos de Auditoría

Todos los registros incluyen campos de auditoría para rastrear cambios:

### Campos Obligatorios
- **createdAt**: Fecha y hora de creación (ISO 8601)
- **createdBy**: ID del usuario que creó el registro
- **updatedAt**: Fecha y hora de última modificación (ISO 8601)
- **updatedBy**: ID del usuario que realizó la última modificación

### Campos Opcionales (Soft Delete)
- **deletedAt**: Fecha y hora de eliminación (null si no está eliminado)
- **deletedBy**: ID del usuario que eliminó el registro

### Ejemplo de Soft Delete

```json
{
  "id": "usr_123456",
  "nombres": "Juan Carlos",
  "apellidos": "Pérez González",
  "estado": "inactivo",
  "isActive": false,
  
  "createdAt": "2025-01-15T10:30:00Z",
  "createdBy": "usr_000001",
  "updatedAt": "2025-11-05T14:30:00Z",
  "updatedBy": "usr_000001",
  "deletedAt": "2025-11-05T14:30:00Z",
  "deletedBy": "usr_000001"
}
```

### Endpoint de Auditoría

#### `GET /api/users/:id/audit-log`
Obtener historial completo de cambios de un usuario.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "audit_001",
      "userId": "usr_123456",
      "action": "update",
      "changes": {
        "especialidades": {
          "before": ["1"],
          "after": ["1", "3"]
        },
        "consultorio": {
          "before": "101",
          "after": "102"
        }
      },
      "performedBy": "usr_000001",
      "performedByName": "Carlos Alberto Rodríguez",
      "timestamp": "2025-11-05T14:30:00Z",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0..."
    },
    {
      "id": "audit_002",
      "userId": "usr_123456",
      "action": "create",
      "changes": null,
      "performedBy": "usr_000001",
      "performedByName": "Carlos Alberto Rodríguez",
      "timestamp": "2025-01-15T10:30:00Z",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0..."
    }
  ]
}
```

---

## Notas Importantes

1. **clinicId**: Campo obligatorio para multi-tenancy. Se asigna automáticamente desde el usuario autenticado
2. **Password**: Solo se envía en la creación, nunca se retorna en las respuestas
3. **name**: Campo computed (nombres + apellidos), puede ser generado en backend
4. **isActive**: Derivado de `estado === 'activo'`
5. **permissions**: Pueden ser asignados por defecto según el rol o personalizados
6. **especialidades**: Deben existir en la configuración del sistema y pertenecer a la misma clínica
7. **consultorio**: Debe existir en la configuración del sistema y pertenecer a la misma clínica
8. **horariosAtencion**: Solo para doctores, días 1-6 (Lunes a Sábado)
9. **Auditoría**: Todos los campos de auditoría son gestionados automáticamente por el backend
10. **Soft Delete**: Los registros nunca se eliminan físicamente, solo se marcan como eliminados
11. **createdBy/updatedBy**: Deben ser IDs válidos de usuarios existentes (usar "system" para acciones automáticas)
12. **Multi-tenancy**: Todas las consultas deben filtrar por `clinicId` para garantizar aislamiento de datos
