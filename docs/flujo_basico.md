Flujo básico de turnos y acceso a registros
==========================================

Fecha: 2025-10-20
Última actualización: 2026-01-15

Resumen
-------
Este documento describe el flujo actual de trabajo para la gestión de turnos y el acceso a los registros médicos en la clínica. Define los actores, sus responsabilidades y las reglas de visibilidad de las consultas y registros médicos.

Actores
-------
- **Paciente**: Solicita turnos (puede hacerlo online o vía teléfono/presencial).
- **Secretaria**: Gestiona la asignación y confirmación de turnos, registra la llegada del paciente en recepción y asigna la consulta al doctor correspondiente.
- **Doctor**: Atiende pacientes y visualiza únicamente las consultas y registros médicos asociados a sus especialidades y a pacientes asignados a su agenda.
- **Admin (Administrador de la clínica)**: Tiene permisos amplios y puede ver todos los registros médicos y consultas de todos los doctores dentro de su clínica.

Flujo de turnos
---------------
1. **Solicitud de turno**: El paciente solicita un turno indicando preferencia (online/presencial) y el especialista requerido.
2. **Asignación**: La secretaria revisa la disponibilidad y asigna el turno en el calendario. La secretaria es la única que crea/edita/cancela turnos.
3. **Gestión previa**: Antes de la consulta, la secretaria puede enviar recordatorios y gestionar reprogramaciones.
4. **Check-in**: El día de la consulta, cuando el paciente llega a la clínica, la secretaria registra la recepción en el sistema mediante el endpoint `POST /api/appointments/:id/check-in`.
5. **Visibilidad del doctor**: Una vez que la recepción es confirmada por la secretaria, la consulta cambia de estado a `esperando` y automáticamente aparece en el listado del doctor (`/doctor/consultations`).

Estados de la cita
------------------
- `programada`: Turno creado pero no confirmado por recepción.
- `confirmada`: La secretaria registró la llegada del paciente; la consulta será visible por el doctor.
- `esperando`: Estado intermedio después del check-in, indica que el paciente está esperando ser atendido.
- `en_curso`: El doctor está atendiendo la consulta.
- `completada`: Consulta finalizada y registro guardado.
- `cancelada`: Turno cancelado por paciente o secretaria.
- `no_asistio`: Paciente no se presentó a la cita.

Reglas de visibilidad y permisos
--------------------------------
- **Secretaria**: Puede ver y gestionar todos los turnos y citas (crear, editar, cancelar, registrar llegada).
- **Doctor**: Solo puede ver:
  - Consultas asignadas a él (filtrado por `doctorId`).
  - Consultas con estado `esperando`, `en_curso`, `completada` o `cancelada`.
  - Registros médicos que pertenezcan a sus especialidades (p. ej., un dermatólogo no ve registros de odontología).
- **Admin**: Puede ver todos los registros médicos y consultas de todos los doctores en la clínica.

Endpoints principales
-------------------
### Gestión de Turnos
- `POST /api/appointments` - Crear nuevo turno
- `GET /api/appointments` - Listar turnos (con filtros por doctor, paciente, fecha, estado)
- `POST /api/appointments/:id/check-in` - Registrar llegada del paciente
- `PUT /api/appointments/:id` - Actualizar turno
- `DELETE /api/appointments/:id` - Cancelar turno

### Gestión de Pacientes
- `GET /api/patients` - Listar pacientes (incluye `ultimaConsulta`)
- `GET /api/patients/:id` - Obtener detalle de paciente
- `POST /api/patients` - Crear nuevo paciente

### Registros Médicos
- `GET /api/medical-records` - Listar registros médicos
- `GET /api/medical-records/patient/:id` - Registros por paciente
- `POST /api/medical-records` - Crear nuevo registro

Flujo de atención
-----------------
1. **Preparación**: Doctor revisa su agenda en `/doctor/consultations` para ver pacientes con estado `esperando`.
2. **Inicio de consulta**: Doctor hace clic en "Iniciar consulta" → estado cambia a `en_curso`.
3. **Registro médico**: Durante la atención, doctor completa el formulario de registro médico.
4. **Finalización**: Al completar, doctor guarda el registro → estado cambia a `completada`.
5. **Historial clínico**: Todos los registros quedan accesibles en `/historiales/:patientId`.

Notas de implementación
-----------------------
- **Multi-tenancy**: Todos los endpoints requieren header `X-Clinic-Id`.
- **Auditoría**: Operaciones requieren header `X-User-Id` para registro de auditoría.
- **Filtrado por especialidad**: Los doctores solo ven registros de sus especialidades configuradas.
- **Última consulta**: El endpoint `/api/patients` ahora incluye campo `ultimaConsulta` con la fecha del último registro médico.

Componentes clave del frontend
------------------------------
- **Secretary/Appointments**: Gestión completa de turnos para secretarias.
- **Doctor/Consultations**: Vista del doctor con sus consultas asignadas.
- **Calendar**: Calendario integrado para visualización y gestión de turnos.
- **Historiales**: Historial médico completo por paciente.

Siguientes pasos
-----------------
- ✅ Implementar check-in de pacientes (`/api/appointments/:id/check-in`)
- ✅ Agregar campo `ultimaConsulta` en listado de pacientes
- 🔄 Implementar filtrado de registros por especialidad del doctor
- 🔄 Agregar tests de permisos y e2e flows para confirmación de recepción
- 🔄 Optimizar consultas agregadas para mejorar rendimiento
- 🔄 Implementar notificaciones en tiempo real para cambios de estado

