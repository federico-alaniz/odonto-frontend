# Sistema de Datos Fake - Clínica Médica Integral

Este directorio contiene un sistema completo de datos ficticios para simular un sistema de gestión médica con diferentes roles granulares.

## 📋 Estructura de Archivos

```
src/utils/
├── fake-data-types.ts          # Definiciones de tipos TypeScript
├── fake-users.ts               # Usuarios (Admin, Secretarias, Doctores)
├── fake-patients.ts            # Pacientes con datos médicos completos
├── fake-appointments.ts        # Citas médicas y agenda
├── fake-medical-records.ts     # Historiales médicos detallados
├── fake-billing.ts            # Sistema de facturación
├── fake-notifications.ts       # Notificaciones y logs del sistema
├── fake-data.ts               # Exportaciones centralizadas
└── README.md                  # Esta documentación
```

## 🎭 Roles del Sistema

### 👑 **Administrador (Admin)**
- **Usuarios**: Federico Alaniz, María Laura Rodríguez
- **Permisos**: Acceso total al sistema
- **Funciones**: Gestión de usuarios, configuración, reportes, auditoría

### 👩‍💼 **Secretaria/Recepcionista**
- **Usuarios**: Carmen López, Patricia Fernández, Silvia Martínez  
- **Permisos**: Gestión de pacientes, citas, facturación básica
- **Funciones**: Recepción, agenda, cobros, comunicaciones

### 👨‍⚕️ **Doctor/Médico**
- **Usuarios**: Dr. Miguel Herrera, Dra. Ana Gutierrez, Dr. Carlos Mendoza, Dra. Elena Vargas, Dr. Roberto Silva, Dra. Lucía Morales
- **Permisos**: Sus pacientes, historiales médicos, prescripciones
- **Especialidades**: Clínica médica, Cardiología, Pediatría, Odontología, Traumatología, Ginecología

## 📊 Datos Incluidos

### 🏥 **Clínica**
- **10 pacientes** con historiales completos
- **17 citas médicas** (hoy, mañana, próximas semanas)
- **10 registros médicos** detallados con diagnósticos
- **12 facturas** en diferentes estados
- **13 notificaciones** por rol y prioridad
- **8 logs del sistema** para auditoría

### 📈 **Estadísticas del Sistema**
- Pacientes totales: 10
- Citas de hoy: 5
- Doctores activos: 6
- Ingresos del mes: $285,000 ARS
- Ocupación consultorios: 75%

## 🚀 Uso del Sistema

### Importación Básica
```typescript
import { 
  users, 
  patients, 
  appointments, 
  getCurrentDate,
  getAdminDashboard 
} from '@/utils/fake-data';
```

### Dashboards por Rol
```typescript
// Dashboard de Administrador
const adminData = getAdminDashboard('user_admin_001');

// Dashboard de Doctor
const doctorData = getDoctorDashboard('user_doc_001');

// Dashboard de Secretaria  
const secretaryData = getSecretaryDashboard('user_sec_001');
```

### Búsqueda Global
```typescript
const searchResults = globalSearch('María');
// Retorna: { patients: [], users: [], appointments: [], total: number }
```

### Validación de Permisos
```typescript
const canEdit = validateUserPermissions(
  'user_doc_001', 
  'patients', 
  'update'
);
```

## 📅 Datos de Ejemplo

### Citas de Hoy (18 Oct 2025)
- **09:00** - María González (Control HTA) - Dr. Herrera ✅ Completada
- **10:00** - Ana Martínez (Dolor abdominal) - Dr. Herrera 🔄 En curso  
- **11:00** - Diego Fernández (Control fractura) - Dr. Silva ✅ Completada
- **15:00** - Isabella Ramírez (Control pediatría) - Dr. Mendoza ⏳ Confirmada
- **16:00** - Juan Rodríguez (Odontología) - Dra. Gutierrez ⏳ Programada

### Pacientes por Doctor
- **Dr. Herrera (Clínica)**: María González, Ana Martínez, Roberto García
- **Dra. Gutierrez (Odonto)**: Juan Rodríguez, Luis Mendez  
- **Dr. Mendoza (Pediatría)**: Isabella Ramírez
- **Dra. Vargas (Cardio)**: Carlos Vargas, Carmen Ruiz
- **Dr. Silva (Trauma)**: Diego Fernández
- **Dra. Morales (Gineco)**: Daniela Torres

## 💰 Sistema de Facturación

### Estados de Facturas
- **Pagadas**: $178,900 ARS (8 facturas)
- **Pendientes**: $66,000 ARS (3 facturas)
- **Vencidas**: $10,400 ARS (1 factura)

### Métodos de Pago
- Obra Social/Seguro: 50%
- Efectivo: 25%
- Tarjeta: 12.5%
- Transferencia: 12.5%

## 🔔 Sistema de Notificaciones

### Por Tipo
- **Médicas**: Resultados críticos, interconsultas
- **Citas**: Confirmaciones, no asistencias  
- **Pagos**: Facturas vencidas, recordatorios
- **Sistema**: Backups, nuevos usuarios
- **Recordatorios**: Tareas pendientes

### Por Prioridad
- **Crítica**: Resultados laboratorio urgentes
- **Alta**: Pacientes no asistieron
- **Media**: Facturas vencidas, interconsultas
- **Baja**: Confirmaciones, controles rutinarios

## 🔍 Funciones Helper

### Pacientes
```typescript
getPatientById(id)
getPatientsByDoctor(doctorId) 
searchPatients(query)
getPatientsByAgeRange(min, max)
```

### Citas
```typescript
getAppointmentsByDate(date)
getTodayAppointments()
getUpcomingAppointments(days)
getDoctorAvailableSlots(doctorId, date)
```

### Facturación
```typescript
getBillsByStatus('pending')
getRevenueByDateRange(start, end)
getBillsStatistics()
```

### Notificaciones
```typescript
getUnreadNotifications(userId)
getNotificationsByPriority('high')
markNotificationAsRead(notificationId)
```

## 🎯 Casos de Uso

### Para Desarrollo
```typescript
// Simular login de doctor
const doctor = users.find(u => u.role === 'doctor');
const dashboard = getDoctorDashboard(doctor.id);

// Mostrar citas de hoy
const todayAppts = getTodayAppointments();

// Verificar permisos
const canCreateRecord = validateUserPermissions(
  doctor.id, 
  'medical-records', 
  'create'
);
```

### Para Testing
```typescript
// Buscar paciente específico
const patient = getPatientById('pat_001');

// Obtener historial médico
const records = getMedicalRecordsByPatient('pat_001');

// Verificar facturación
const bills = getBillsByPatient('pat_001');
```

## 🔧 Personalización

### Agregar Nuevos Datos
1. Editar el archivo correspondiente (`fake-patients.ts`, etc.)
2. Mantener consistencia en IDs y relaciones
3. Exportar nuevas funciones helper si es necesario

### Modificar Roles/Permisos
1. Editar `roles` en `fake-users.ts`
2. Ajustar función `validateUserPermissions`
3. Actualizar dashboards correspondientes

## 📚 Tipos TypeScript

Todos los tipos están definidos en `fake-data-types.ts`:
- `User`, `UserRole`, `Permission`
- `Patient`, `Appointment`, `MedicalRecord`  
- `Bill`, `Notification`, `SystemLog`
- `DashboardStats`, `ClinicSettings`

## 🎨 Integración con UI

### Ejemplo con React
```typescript
function PatientsList() {
  const patients = getActivePatients();
  
  return (
    <div>
      {patients.map(patient => (
        <div key={patient.id}>
          {patient.nombres} {patient.apellidos}
          <span>Edad: {calculateAge(patient.fechaNacimiento)}</span>
        </div>
      ))}
    </div>
  );
}
```

### Formateo de Datos
```typescript
formatDate('2025-10-18') // "18 de octubre de 2025"
formatCurrency(15000) // "$15.000,00"
calculateAge('1978-03-15') // 47
```

---

**✨ Sistema completo y consistente listo para probar todas las funcionalidades del sistema médico con vista granular por roles.**