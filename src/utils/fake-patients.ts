import { Patient } from './fake-data-types';

export const patients: Patient[] = [
  {
    id: 'pat_001',
    nombres: 'María Elena',
    apellidos: 'González',
    tipoDocumento: 'dni',
    numeroDocumento: '12345678',
    fechaNacimiento: '1978-03-15',
    genero: 'femenino',
    telefono: '3001234567',
    email: 'maria.gonzalez@email.com',
    direccion: {
      calle: 'Av. Corrientes',
      numero: '1234',
      ciudad: 'Buenos Aires',
      provincia: 'Buenos Aires',
      codigoPostal: '1043'
    },
    tipoSangre: 'O+',
    contactoEmergencia: {
      nombre: 'Jorge González',
      telefono: '3001234568',
      relacion: 'Esposo'
    },
    seguroMedico: {
      empresa: 'OSDE',
      numeroPoliza: 'OSDE-123456',
      vigencia: '2026-03-15'
    },
    alergias: ['Penicilina'],
    medicamentosActuales: ['Losartán 50mg'],
    antecedentesPersonales: ['Hipertensión arterial'],
    antecedentesFamiliares: ['Diabetes tipo 2 (madre)', 'Hipertensión (padre)'],
    ultimaConsulta: '2025-10-14',
    proximaCita: '2025-10-25',
    estado: 'activo',
    fechaRegistro: '2024-01-15T10:00:00Z',
    doctorAsignado: 'user_doc_001'
  },
  {
    id: 'pat_002',
    nombres: 'Juan Carlos',
    apellidos: 'Rodríguez',
    tipoDocumento: 'dni',
    numeroDocumento: '23456789',
    fechaNacimiento: '1985-07-22',
    genero: 'masculino',
    telefono: '3009876543',
    email: 'juan.rodriguez@email.com',
    direccion: {
      calle: 'San Martín',
      numero: '567',
      ciudad: 'Córdoba',
      provincia: 'Córdoba',
      codigoPostal: '5000'
    },
    tipoSangre: 'A+',
    contactoEmergencia: {
      nombre: 'Ana Rodríguez',
      telefono: '3009876544',
      relacion: 'Esposa'
    },
    alergias: [],
    medicamentosActuales: [],
    antecedentesPersonales: [],
    antecedentesFamiliares: ['Cáncer de próstata (padre)'],
    ultimaConsulta: '2025-10-09',
    proximaCita: '2025-11-09',
    estado: 'activo',
    fechaRegistro: '2024-02-20T11:30:00Z',
    doctorAsignado: 'user_doc_002'
  },
  {
    id: 'pat_003',
    nombres: 'Ana Sofía',
    apellidos: 'Martínez',
    tipoDocumento: 'dni',
    numeroDocumento: '34567890',
    fechaNacimiento: '1990-12-05',
    genero: 'femenino',
    telefono: '3005555555',
    email: 'ana.martinez@email.com',
    direccion: {
      calle: 'Pellegrini',
      numero: '890',
      ciudad: 'Rosario',
      provincia: 'Santa Fe',
      codigoPostal: '2000'
    },
    tipoSangre: 'B+',
    contactoEmergencia: {
      nombre: 'Luis Martínez',
      telefono: '3005555556',
      relacion: 'Padre'
    },
    seguroMedico: {
      empresa: 'Swiss Medical',
      numeroPoliza: 'SM-789123',
      vigencia: '2025-12-05'
    },
    alergias: ['Mariscos', 'Polen'],
    medicamentosActuales: ['Anticonceptivos orales'],
    antecedentesPersonales: ['Asma bronquial'],
    antecedentesFamiliares: ['Asma (madre)', 'Hipertensión (abuelo paterno)'],
    ultimaConsulta: '2025-10-11',
    proximaCita: '2025-10-30',
    estado: 'activo',
    fechaRegistro: '2024-03-10T09:15:00Z',
    doctorAsignado: 'user_doc_001'
  },
  {
    id: 'pat_004',
    nombres: 'Carlos Eduardo',
    apellidos: 'Vargas',
    tipoDocumento: 'dni',
    numeroDocumento: '45678901',
    fechaNacimiento: '1975-09-12',
    genero: 'masculino',
    telefono: '3003333333',
    email: 'carlos.vargas@email.com',
    direccion: {
      calle: 'Las Heras',
      numero: '456',
      ciudad: 'Mendoza',
      provincia: 'Mendoza',
      codigoPostal: '5500'
    },
    tipoSangre: 'AB+',
    contactoEmergencia: {
      nombre: 'Marta Vargas',
      telefono: '3003333334',
      relacion: 'Esposa'
    },
    alergias: ['Aspirina'],
    medicamentosActuales: ['Metformina 850mg', 'Atorvastatina 20mg'],
    antecedentesPersonales: ['Diabetes tipo 2', 'Dislipidemia'],
    antecedentesFamiliares: ['Diabetes tipo 2 (ambos padres)', 'Enfermedad cardiovascular (padre)'],
    ultimaConsulta: '2025-10-13',
    proximaCita: '2025-11-13',
    estado: 'activo',
    fechaRegistro: '2024-01-25T14:20:00Z',
    doctorAsignado: 'user_doc_004'
  },
  {
    id: 'pat_005',
    nombres: 'Isabella',
    apellidos: 'Ramírez',
    tipoDocumento: 'dni',
    numeroDocumento: '56789012',
    fechaNacimiento: '2015-04-18',
    genero: 'femenino',
    telefono: '3006666666',
    email: 'isabella.ramirez@email.com',
    direccion: {
      calle: 'Diagonal 74',
      numero: '123',
      ciudad: 'La Plata',
      provincia: 'Buenos Aires',
      codigoPostal: '1900'
    },
    tipoSangre: 'O-',
    contactoEmergencia: {
      nombre: 'Sandra Ramírez',
      telefono: '3006666667',
      relacion: 'Madre'
    },
    seguroMedico: {
      empresa: 'IOMA',
      numeroPoliza: 'IOMA-456789',
      vigencia: '2026-04-18'
    },
    alergias: ['Látex'],
    medicamentosActuales: [],
    antecedentesPersonales: [],
    antecedentesFamiliares: ['Asma (madre)'],
    ultimaConsulta: '2025-10-10',
    proximaCita: '2025-10-28',
    estado: 'activo',
    fechaRegistro: '2024-04-18T16:00:00Z',
    doctorAsignado: 'user_doc_003'
  },
  {
    id: 'pat_006',
    nombres: 'Roberto',
    apellidos: 'García',
    tipoDocumento: 'dni',
    numeroDocumento: '67890123',
    fechaNacimiento: '1988-09-12',
    genero: 'masculino',
    telefono: '3007777777',
    email: 'roberto.garcia@email.com',
    direccion: {
      calle: 'Belgrano',
      numero: '789',
      ciudad: 'San Miguel de Tucumán',
      provincia: 'Tucumán',
      codigoPostal: '4000'
    },
    tipoSangre: 'A-',
    contactoEmergencia: {
      nombre: 'Elena García',
      telefono: '3007777778',
      relacion: 'Hermana'
    },
    alergias: [],
    medicamentosActuales: ['Omeprazol 20mg'],
    antecedentesPersonales: ['Gastritis crónica'],
    antecedentesFamiliares: ['Úlcera péptica (padre)'],
    ultimaConsulta: '2025-10-12',
    proximaCita: '2025-11-12',
    estado: 'activo',
    fechaRegistro: '2024-05-05T13:45:00Z',
    doctorAsignado: 'user_doc_001'
  },
  {
    id: 'pat_007',
    nombres: 'Daniela',
    apellidos: 'Torres',
    tipoDocumento: 'dni',
    numeroDocumento: '78901234',
    fechaNacimiento: '1992-08-25',
    genero: 'femenino',
    telefono: '3001010101',
    email: 'daniela.torres@email.com',
    direccion: {
      calle: 'Av. Libertador',
      numero: '4567',
      ciudad: 'Buenos Aires',
      provincia: 'Buenos Aires',
      codigoPostal: '1425'
    },
    tipoSangre: 'B-',
    contactoEmergencia: {
      nombre: 'Miguel Torres',
      telefono: '3001010102',
      relacion: 'Hermano'
    },
    seguroMedico: {
      empresa: 'Galeno',
      numeroPoliza: 'GAL-321654',
      vigencia: '2025-08-25'
    },
    alergias: ['Ibuprofeno'],
    medicamentosActuales: ['Anticonceptivos orales', 'Hierro 300mg'],
    antecedentesPersonales: ['Anemia ferropénica'],
    antecedentesFamiliares: ['Anemia (madre)', 'Hipertensión (abuelo materno)'],
    ultimaConsulta: '2025-10-15',
    proximaCita: '2025-11-01',
    estado: 'activo',
    fechaRegistro: '2024-06-12T11:20:00Z',
    doctorAsignado: 'user_doc_006'
  },
  {
    id: 'pat_008',
    nombres: 'Diego',
    apellidos: 'Fernández',
    tipoDocumento: 'dni',
    numeroDocumento: '89012345',
    fechaNacimiento: '1982-11-08',
    genero: 'masculino',
    telefono: '3008888888',
    email: 'diego.fernandez@email.com',
    direccion: {
      calle: 'Mitre',
      numero: '234',
      ciudad: 'Mar del Plata',
      provincia: 'Buenos Aires',
      codigoPostal: '7600'
    },
    tipoSangre: 'O+',
    contactoEmergencia: {
      nombre: 'Carla Fernández',
      telefono: '3008888889',
      relacion: 'Esposa'
    },
    alergias: [],
    medicamentosActuales: [],
    antecedentesPersonales: ['Fractura de tibia (2020)'],
    antecedentesFamiliares: ['Artritis (madre)'],
    ultimaConsulta: '2025-10-08',
    proximaCita: '2025-10-22',
    estado: 'activo',
    fechaRegistro: '2024-07-03T15:10:00Z',
    doctorAsignado: 'user_doc_005'
  },
  {
    id: 'pat_009',
    nombres: 'Carmen',
    apellidos: 'Ruiz',
    tipoDocumento: 'dni',
    numeroDocumento: '90123456',
    fechaNacimiento: '1965-01-30',
    genero: 'femenino',
    telefono: '3009999999',
    email: 'carmen.ruiz@email.com',
    direccion: {
      calle: 'Rivadavia',
      numero: '1111',
      ciudad: 'Buenos Aires',
      provincia: 'Buenos Aires',
      codigoPostal: '1033'
    },
    tipoSangre: 'A+',
    contactoEmergencia: {
      nombre: 'Patricia Ruiz',
      telefono: '3009999990',
      relacion: 'Hija'
    },
    seguroMedico: {
      empresa: 'PAMI',
      numeroPoliza: 'PAMI-987654',
      vigencia: '2026-01-30'
    },
    alergias: ['Sulfonamidas'],
    medicamentosActuales: ['Amlodipina 5mg', 'Simvastatina 20mg', 'Ácido acetilsalicílico 100mg'],
    antecedentesPersonales: ['Hipertensión arterial', 'Dislipidemia', 'Osteoartrosis'],
    antecedentesFamiliares: ['Hipertensión (madre)', 'Infarto (padre)', 'Artritis (hermana)'],
    ultimaConsulta: '2025-10-16',
    proximaCita: '2025-11-16',
    estado: 'activo',
    fechaRegistro: '2024-08-15T12:00:00Z',
    doctorAsignado: 'user_doc_004'
  },
  {
    id: 'pat_010',
    nombres: 'Luis Alberto',
    apellidos: 'Mendez',
    tipoDocumento: 'dni',
    numeroDocumento: '01234567',
    fechaNacimiento: '1995-06-14',
    genero: 'masculino',
    telefono: '3000000000',
    email: 'luis.mendez@email.com',
    direccion: {
      calle: 'Sarmiento',
      numero: '678',
      ciudad: 'Córdoba',
      provincia: 'Córdoba',
      codigoPostal: '5000'
    },
    tipoSangre: 'AB-',
    contactoEmergencia: {
      nombre: 'María Mendez',
      telefono: '3000000001',
      relacion: 'Madre'
    },
    alergias: [],
    medicamentosActuales: [],
    antecedentesPersonales: [],
    antecedentesFamiliares: ['Diabetes tipo 1 (hermano)'],
    ultimaConsulta: '2025-10-17',
    proximaCita: '2025-12-17',
    estado: 'activo',
    fechaRegistro: '2024-09-20T08:30:00Z',
    doctorAsignado: 'user_doc_002'
  }
];

// Funciones helper para manejo de pacientes
export const getPatientById = (id: string): Patient | undefined => {
  return patients.find(patient => patient.id === id);
};

export const getPatientsByDoctor = (doctorId: string): Patient[] => {
  return patients.filter(patient => patient.doctorAsignado === doctorId);
};

export const getActivePatients = (): Patient[] => {
  return patients.filter(patient => patient.estado === 'activo');
};

export const searchPatients = (query: string): Patient[] => {
  const lowercaseQuery = query.toLowerCase();
  return patients.filter(patient => 
    patient.nombres.toLowerCase().includes(lowercaseQuery) ||
    patient.apellidos.toLowerCase().includes(lowercaseQuery) ||
    patient.numeroDocumento.includes(query) ||
    patient.email.toLowerCase().includes(lowercaseQuery)
  );
};

export const getPatientsByAgeRange = (minAge: number, maxAge: number): Patient[] => {
  const currentYear = new Date().getFullYear();
  return patients.filter(patient => {
    const birthYear = new Date(patient.fechaNacimiento).getFullYear();
    const age = currentYear - birthYear;
    return age >= minAge && age <= maxAge;
  });
};