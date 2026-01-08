# Informe de Optimizaciones - Frontend

## Resumen Ejecutivo

Se identificaron múltiples oportunidades de mejora en el código frontend relacionadas con:
- Funciones duplicadas en diferentes archivos
- Uso excesivo de `any` en lugar de interfaces tipadas
- Falta de centralización de utilidades comunes

---

## 1. Funciones Duplicadas (Alta Prioridad)

### 1.1 `getSpecialtyName()` - 3 implementaciones distintas

| Archivo | Línea |
|---------|-------|
| `app/admin/dashboard/page.tsx` | ~339 |
| `app/secretary/medical-staff/page.tsx` | ~254 |
| `app/secretary/reception/page.tsx` | ~268 |

**Solución:** Crear `utils/specialty-helpers.ts` con una única función centralizada.

```typescript
// utils/specialty-helpers.ts
export const getSpecialtyName = (specialty: string): string => {
  const names: Record<string, string> = {
    'clinica-medica': 'Clínica Médica',
    'medicina-interna': 'Medicina Interna',
    'cardiologia': 'Cardiología',
    // ... resto de especialidades
  };
  return names[specialty] || specialty;
};
```

---

### 1.2 `calculateAge()` - 5 implementaciones idénticas

| Archivo | Línea |
|---------|-------|
| `app/pacientes/PatientsTable.tsx` | ~163 |
| `app/pacientes/modals/ViewPatientModal.tsx` | ~67 |
| `app/secretary/patients/SecretaryPatientsTable.tsx` | ~218 |
| `app/secretary/patients/[id]/page.tsx` | ~231 |
| `app/perfil/page.tsx` | ~77 |

**Solución:** Agregar a `utils/date-helper.ts`:

```typescript
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};
```

---

### 1.3 `getStatusColor()` - 4 implementaciones diferentes

| Archivo | Contexto |
|---------|----------|
| `app/admin/dashboard/page.tsx` | Estados de citas (confirmado, pendiente) |
| `app/calendario/Calendar.tsx` | Estados de citas (confirmada, programada) |
| `app/historiales/components/PatientHistoryList.tsx` | Estados de historial (active, closed) |
| `app/registros/page.tsx` | Estados de registros |

**Nota:** Ya existe `utils/appointment-status.ts` con `getAppointmentStatusConfig()`. Se debe usar consistentemente.

**Solución:** Extender `utils/appointment-status.ts` y eliminar las funciones locales.

---

### 1.4 `getDoctorName()` / `getPatientName()` - Duplicadas

| Archivo |
|---------|
| `app/admin/dashboard/page.tsx` |
| `app/secretary/appointments/page.tsx` |

**Solución:** Crear `utils/entity-helpers.ts`:

```typescript
export const getFullName = (entity: { nombres?: string; apellidos?: string } | null): string => {
  if (!entity) return '';
  return `${entity.nombres || ''} ${entity.apellidos || ''}`.trim();
};
```

---

## 2. Uso Excesivo de `any` (Media Prioridad)

### 2.1 Estados con `useState<any>` - 9 archivos

| Archivo | Cantidad |
|---------|----------|
| `app/doctor/patients/[id]/medical-record/page.tsx` | 2 |
| `app/historiales/[id]/registro/new/page.tsx` | 2 |
| `app/admin/settings/page.tsx` | 1 |
| `app/historiales/[id]/page.tsx` | 1 |
| `app/historiales/[id]/registro/[registroId]/page.tsx` | 1 |
| `app/platform/tenants/page.tsx` | 1 |
| `app/secretary/patients/[id]/edit/page.tsx` | 1 |

**Solución:** Reemplazar con interfaces específicas.

---

### 2.2 Parámetros con tipo `any` - 131 ocurrencias en 36 archivos

**Archivos más afectados:**
- `services/api/clinic-settings.service.ts` - 10 usos
- `services/api/patients.service.ts` - 10 usos
- `app/doctor/dashboard/page.tsx` - 9 usos
- `app/secretary/appointments/page.tsx` - 9 usos
- `app/admin/users/new/NewUserForm.tsx` - 8 usos

**Solución:** Crear interfaces para cada entidad en `types/`.

---

### 2.3 Arrays sin tipar `any[]` - 16 ocurrencias

| Archivo | Cantidad |
|---------|----------|
| `app/admin/dashboard/page.tsx` | 4 |
| `app/historiales/adapter.ts` | 3 |
| `app/page.tsx` | 3 |
| `app/doctor/consultations/new/NewConsultationForm.tsx` | 2 |

---

## 3. Interfaces Faltantes (Media Prioridad)

### 3.1 Interfaces de Entidades Principales

Ya existen pero dispersas:

| Entidad | Ubicación Actual | Recomendación |
|---------|------------------|---------------|
| `User` | `types/roles.ts` | ✅ Bien ubicada |
| `Patient` | Múltiples archivos locales | Centralizar en `types/patient.ts` |
| `Appointment` | `services/api/appointments.service.ts` | Mover a `types/appointment.ts` |
| `Doctor` | Múltiples archivos locales | Usar `User` con filtro de rol |

### 3.2 Interfaces Repetidas Localmente

`interface Patient` definida en 13 archivos diferentes:
- `services/api/patients.service.ts`
- `app/secretary/patients/[id]/page.tsx`
- `app/pacientes/PatientsTable.tsx`
- `app/doctor/consultations/new/NewConsultationForm.tsx`
- Y 9 más...

`interface Appointment` definida en 8 archivos diferentes.

`interface Doctor` definida en 7 archivos diferentes.

---

## 4. Formato de Fechas (Baja Prioridad)

### 4.1 `toLocaleDateString()` usado inconsistentemente - 37 ocurrencias

Diferentes formatos en diferentes lugares:
- `{ day: 'numeric', month: 'short', year: 'numeric' }`
- `{ weekday: 'short', day: 'numeric' }`
- Sin opciones

**Solución:** Ya existe `utils/date-helper.ts`. Agregar funciones estandarizadas:

```typescript
export const formatDateShort = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateFull = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
```

---

## 5. Plan de Acción Recomendado

### Fase 1 - Centralizar Utilidades (1-2 días)
- [ ] Crear `utils/specialty-helpers.ts` con `getSpecialtyName()`
- [ ] Agregar `calculateAge()` a `utils/date-helper.ts`
- [ ] Crear `utils/entity-helpers.ts` con `getFullName()`
- [ ] Agregar funciones de formato de fecha estandarizadas
- [ ] Actualizar `utils/index.ts` para exportar todo

### Fase 2 - Centralizar Interfaces (2-3 días)
- [ ] Crear `types/patient.ts` con interface `Patient`
- [ ] Crear `types/appointment.ts` con interface `Appointment`
- [ ] Crear `types/index.ts` para exportar todas las interfaces
- [ ] Actualizar imports en archivos afectados

### Fase 3 - Eliminar `any` (3-5 días)
- [ ] Reemplazar `useState<any>` con tipos específicos
- [ ] Tipar parámetros de funciones
- [ ] Tipar arrays

### Fase 4 - Refactorizar Componentes (Continuo)
- [ ] Reemplazar funciones locales por utilidades centralizadas
- [ ] Usar `getAppointmentStatusConfig()` consistentemente

---

## 6. Archivos de Utilidades Actuales

```
src/utils/
├── appointment-state-mapper.ts  ✅ Bien
├── appointment-status.ts        ✅ Bien (usar más)
├── argentina-data.ts            ✅ Bien
├── argentina-utils.ts           ✅ Bien
├── date-helper.ts               ⚠️  Ampliar con más funciones
├── format-helpers.ts            ⚠️  Ampliar
├── index.ts                     ⚠️  Actualizar exports
└── roleConfig.ts                ✅ Bien
```

---

## 7. Métricas

| Métrica | Valor |
|---------|-------|
| Funciones duplicadas identificadas | 4 principales |
| Total de duplicaciones | ~20 instancias |
| Archivos con `any` | 36 |
| Ocurrencias de `any` | 131+ |
| Interfaces repetidas | 3 principales en ~28 archivos |

---

*Documento generado el 8 de enero de 2026*
