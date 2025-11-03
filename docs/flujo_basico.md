Flujo básico de turnos y acceso a registros
==========================================

Fecha: 2025-10-20

Resumen
-------
Este documento describe el flujo mínimo de trabajo para la gestión de turnos y el acceso a los registros médicos en la clínica. Define los actores, sus responsabilidades y las reglas de visibilidad de las consultas y registros médicos.

Actores
-------
- Paciente: Solicita turnos (puede hacerlo online o vía teléfono/presencial).
- Secretaria: Gestiona la asignación y confirmación de turnos, registra la llegada del paciente en recepción y asigna la consulta al doctor correspondiente.
- Doctor: Atiende pacientes y visualiza únicamente las consultas y registros médicos asociados a sus especialidades y a pacientes asignados a su agenda.
- Admin (Administrador de la clínica): Tiene permisos amplios y puede ver todos los registros médicos y consultas de todos los doctores dentro de su clínica.

Flujo de turnos
---------------
1. El paciente solicita un turno indicando preferencia (online/presencial) y el especialista requerido.
2. La secretaria revisa la disponibilidad y asigna el turno en el calendario. La secretaria es la única que crea/edita/cancela turnos.
3. Antes de la consulta, la secretaria puede enviar recordatorios y gestionar reprogramaciones.
4. El día de la consulta, cuando el paciente llega a la clínica, la secretaria registra la recepción en el sistema (marcar "registrado/en recepción").
5. Una vez que la recepción es confirmada por la secretaria, la consulta cambia de estado a "confirmada" o "en-curso" y automáticamente aparece en el listado del doctor.

Reglas de visibilidad y permisos
--------------------------------
- La secretaria puede ver y gestionar todos los turnos y citas (crear, editar, cancelar, registrar llegada).
- El doctor solo puede ver:
  - Consultas asignadas a él (por `doctorId`).
  - Registros médicos que pertenezcan a sus especialidades (p. ej., un dermatólogo no ve registros de odontología).
- El admin puede ver todos los registros médicos y consultas de todos los doctores en la clínica.

Estados de la cita
------------------
- `programada`: Turno creado pero no confirmado por recepción.
- `confirmada`: La secretaria registró la llegada del paciente; la consulta será visible por el doctor.
- `en-curso`: El doctor está atendiendo la consulta.
- `completada`: Consulta finalizada y registro guardado.
- `cancelada`: Turno cancelado por paciente o secretaria.

Notas de implementación
-----------------------
- La clave para mantener privacidad es filtrar consultas por `doctorId` y por la lista de especialidades del doctor.
- Recomiendo añadir pruebas unitarias/integración para:
  - Verificar que un doctor A no puede ver consultas de doctor B.
  - Verificar que un administrador puede ver todas las consultas.
  - Verificar que una secretaria puede crear/editar/cancelar turnos y marcar llegada.

Siguientes pasos
----------------
- Mapear los endpoints API necesarios: crear turno, actualizar estado, listar turnos por `doctorId`, listar registros por especialidad.
- Implementar tests de permisos y e2e flows para confirmación de recepción y aparición en el listado del doctor.

