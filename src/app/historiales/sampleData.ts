import { Patient, MedicalRecord, MedicalEntry } from './types';

// Pacientes de muestra
export const samplePatients: Patient[] = [
  {
    id: 'pat_001',
    firstName: 'María Elena',
    lastName: 'González',
    email: 'maria.gonzalez@email.com',
    phone: '3001234567',
    dateOfBirth: '1978-03-15',
    age: 47,
    dni: '12345678',
    gender: 'femenino',
    bloodType: 'O+',
    allergies: ['Penicilina', 'Mariscos'],
    emergencyContact: {
      name: 'Carlos González',
      relationship: 'Esposo',
      phone: '3007654321'
    },
    insurance: {
      provider: 'EPS Salud Total',
      policyNumber: 'ST-12345678'
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2025-10-15T14:30:00Z'
  },
  {
    id: 'pat_002',
    firstName: 'Juan Carlos',
    lastName: 'Rodríguez',
    email: 'juan.rodriguez@email.com',
    phone: '3009876543',
    dateOfBirth: '1985-07-22',
    age: 40,
    dni: '23456789',
    gender: 'masculino',
    bloodType: 'A+',
    allergies: [],
    emergencyContact: {
      name: 'Ana Rodríguez',
      relationship: 'Madre',
      phone: '3001111111'
    },
    createdAt: '2024-03-10T09:00:00Z',
    updatedAt: '2025-10-10T11:00:00Z'
  },
  {
    id: 'pat_003',
    firstName: 'Ana Sofía',
    lastName: 'Martínez',
    email: 'ana.martinez@email.com',
    phone: '3005555555',
    dateOfBirth: '1990-12-05',
    age: 34,
    dni: '34567890',
    gender: 'femenino',
    bloodType: 'B+',
    allergies: ['Ibuprofeno'],
    emergencyContact: {
      name: 'Luis Martínez',
      relationship: 'Padre',
      phone: '3002222222'
    },
    createdAt: '2024-05-20T16:00:00Z',
    updatedAt: '2025-10-12T10:15:00Z'
  },
  {
    id: 'pat_004',
    firstName: 'Carlos Eduardo',
    lastName: 'Vargas',
    email: 'carlos.vargas@email.com',
    phone: '3003333333',
    dateOfBirth: '1975-09-12',
    age: 50,
    dni: '45678901',
    gender: 'masculino',
    bloodType: 'AB+',
    allergies: ['Sulfonamidas'],
    emergencyContact: {
      name: 'Mercedes Vargas',
      relationship: 'Esposa',
      phone: '3004444444'
    },
    insurance: {
      provider: 'Sura EPS',
      policyNumber: 'SU-45678901'
    },
    createdAt: '2024-02-28T14:00:00Z',
    updatedAt: '2025-10-14T16:20:00Z'
  },
  {
    id: 'pat_005',
    firstName: 'Isabella',
    lastName: 'Ramírez',
    email: 'isabella.ramirez@email.com',
    phone: '3006666666',
    dateOfBirth: '2015-04-18',
    age: 10,
    dni: '56789012',
    gender: 'femenino',
    bloodType: 'O-',
    allergies: ['Frutos secos'],
    emergencyContact: {
      name: 'Patricia Ramírez',
      relationship: 'Madre',
      phone: '3007777777'
    },
    insurance: {
      provider: 'Compensar EPS',
      policyNumber: 'CO-56789012'
    },
    createdAt: '2024-04-15T11:30:00Z',
    updatedAt: '2025-10-11T09:45:00Z'
  },
  {
    id: 'pat_006',
    firstName: 'Roberto',
    lastName: 'García',
    email: 'roberto.garcia@email.com',
    phone: '3007777777',
    dateOfBirth: '1988-09-12',
    age: 37,
    dni: '67890123',
    gender: 'masculino',
    bloodType: 'A-',
    allergies: ['Aspirina'],
    emergencyContact: {
      name: 'Carmen García',
      relationship: 'Esposa',
      phone: '3009999999'
    },
    createdAt: '2024-01-20T08:15:00Z',
    updatedAt: '2025-10-13T12:00:00Z'
  },
  {
    id: 'pat_007',
    firstName: 'Daniela',
    lastName: 'Torres',
    email: 'daniela.torres@email.com',
    phone: '3001010101',
    dateOfBirth: '1992-08-25',
    age: 33,
    dni: '78901234',
    gender: 'femenino',
    bloodType: 'B-',
    allergies: [],
    emergencyContact: {
      name: 'Miguel Torres',
      relationship: 'Padre',
      phone: '3002020202'
    },
    insurance: {
      provider: 'Sanitas EPS',
      policyNumber: 'SA-78901234'
    },
    createdAt: '2024-06-10T13:45:00Z',
    updatedAt: '2025-10-16T15:30:00Z'
  }
];

// Registros médicos de muestra
export const sampleMedicalEntries: MedicalEntry[] = [
  // Registros para María Elena González (Cardiología)
  {
    id: 'entry_001',
    consultationDate: '2025-10-15',
    consultationTime: '08:00',
    doctor: 'Dr. Carlos Mendoza',
    specialty: 'cardiologia',
    type: 'consultation',
    chiefComplaint: 'Dolor de cabeza persistente y mareos',
    symptoms: 'Dolor de cabeza persistente, mareos ocasionales y fatiga general',
    physicalExam: 'PA: 145/95 mmHg, FC: 88 lpm, peso: 68 kg, altura: 165 cm',
    diagnosis: 'Hipertensión arterial leve',
    treatment: 'Control dietético y medicación antihipertensiva',
    medications: [
      {
        name: 'Enalapril',
        dosage: '10mg',
        frequency: '1 vez al día',
        duration: '30 días',
        instructions: 'Tomar en ayunas'
      },
      {
        name: 'Amlodipino',
        dosage: '5mg',
        frequency: '1 vez al día',
        duration: '30 días',
        instructions: 'Tomar con alimentos'
      }
    ],
    vitalSigns: {
      bloodPressure: '145/95',
      heartRate: 88,
      temperature: 36.5,
      weight: 68,
      height: 165
    },
    nextAppointment: {
      date: '2025-11-15',
      time: '08:00',
      reason: 'Control de presión arterial'
    },
    notes: 'Paciente refiere mejora en síntomas. Continuar con medicación y control en 1 mes.',
    status: 'active',
    createdAt: '2025-10-15T08:00:00Z',
    updatedAt: '2025-10-15T08:45:00Z'
  },
  {
    id: 'entry_002',
    consultationDate: '2025-09-15',
    consultationTime: '14:30',
    doctor: 'Dr. Carlos Mendoza',
    specialty: 'cardiologia',
    type: 'followup',
    chiefComplaint: 'Control de hipertensión',
    symptoms: 'Leve dolor de cabeza ocasional',
    physicalExam: 'PA: 140/90 mmHg, FC: 85 lpm, peso: 69 kg',
    diagnosis: 'Hipertensión arterial en tratamiento',
    treatment: 'Ajuste de medicación antihipertensiva',
    medications: [
      {
        name: 'Enalapril',
        dosage: '5mg',
        frequency: '1 vez al día',
        duration: '30 días'
      }
    ],
    vitalSigns: {
      bloodPressure: '140/90',
      heartRate: 85,
      weight: 69
    },
    notes: 'Presión arterial estable. Continuar con tratamiento.',
    status: 'completed',
    createdAt: '2025-09-15T14:30:00Z',
    updatedAt: '2025-09-15T15:00:00Z'
  },
  {
    id: 'entry_003',
    consultationDate: '2025-08-15',
    consultationTime: '09:00',
    doctor: 'Dr. Carlos Mendoza',
    specialty: 'cardiologia',
    type: 'consultation',
    chiefComplaint: 'Primera consulta por hipertensión',
    symptoms: 'Dolor de cabeza matutino, visión borrosa ocasional',
    physicalExam: 'PA: 150/95 mmHg, FC: 90 lpm, peso: 70 kg, IMC: 25.7',
    diagnosis: 'Hipertensión arterial de novo',
    treatment: 'Inicio de tratamiento antihipertensivo',
    medications: [
      {
        name: 'Enalapril',
        dosage: '5mg',
        frequency: '1 vez al día',
        duration: '30 días'
      }
    ],
    vitalSigns: {
      bloodPressure: '150/95',
      heartRate: 90,
      weight: 70,
      height: 165
    },
    diagnosticImages: [
      {
        id: 'img_001',
        name: 'ECG_inicial.jpg',
        description: 'Electrocardiograma inicial - Ritmo sinusal normal',
        type: 'otro',
        url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
        uploadDate: '2025-08-15T09:30:00Z'
      }
    ],
    notes: 'Iniciar tratamiento y controles mensuales.',
    status: 'completed',
    createdAt: '2025-08-15T09:00:00Z',
    updatedAt: '2025-08-15T09:45:00Z'
  },

  // Registros para Juan Carlos Rodríguez (Odontología)
  {
    id: 'entry_004',
    consultationDate: '2025-10-10',
    consultationTime: '10:00',
    doctor: 'Dra. Patricia Ruiz',
    specialty: 'odontologia',
    type: 'checkup',
    chiefComplaint: 'Control odontológico preventivo',
    symptoms: 'Sin síntomas específicos',
    physicalExam: 'Examen intraoral completo',
    diagnosis: 'Caries dental en premolar superior derecho',
    treatment: 'Obturación con resina compuesta',
    odontogram: [
      {
        id: 14,
        status: 'caries',
        notes: 'Caries oclusal profunda'
      },
      {
        id: 15,
        status: 'filling',
        notes: 'Obturación antigua en buen estado'
      }
    ],
    nextAppointment: {
      date: '2025-10-20',
      time: '10:00',
      reason: 'Realización de obturación'
    },
    notes: 'Paciente con buena higiene oral. Realizar tratamiento en próxima cita.',
    status: 'active',
    createdAt: '2025-10-10T10:00:00Z',
    updatedAt: '2025-10-10T10:30:00Z'
  },
  {
    id: 'entry_005',
    consultationDate: '2025-07-15',
    consultationTime: '15:30',
    doctor: 'Dra. Patricia Ruiz',
    specialty: 'odontologia',
    type: 'consultation',
    chiefComplaint: 'Dolor dental en molar inferior',
    symptoms: 'Dolor intenso al masticar, sensibilidad al frío',
    physicalExam: 'Caries extensa en molar 36',
    diagnosis: 'Caries profunda con compromiso pulpar',
    treatment: 'Endodoncia',
    medications: [
      {
        name: 'Ibuprofeno',
        dosage: '400mg',
        frequency: 'Cada 8 horas',
        duration: '5 días',
        instructions: 'Tomar con alimentos'
      }
    ],
    odontogram: [
      {
        id: 36,
        status: 'root_canal',
        notes: 'Endodoncia completada'
      }
    ],
    notes: 'Endodoncia exitosa. Control en 15 días.',
    status: 'completed',
    createdAt: '2025-07-15T15:30:00Z',
    updatedAt: '2025-07-15T17:00:00Z'
  },

  // Registros para Ana Sofía Martínez (Medicina General)
  {
    id: 'entry_006',
    consultationDate: '2025-10-12',
    consultationTime: '09:15',
    doctor: 'Dr. Miguel Herrera',
    specialty: 'clinica-medica',
    type: 'consultation',
    chiefComplaint: 'Dolor abdominal y náuseas',
    symptoms: 'Dolor abdominal en epigastrio, náuseas matutinas, pérdida de apetito',
    physicalExam: 'Abdomen blando, dolor en epigastrio a la palpación, ruidos intestinales normales',
    diagnosis: 'Gastritis aguda',
    treatment: 'Tratamiento sintomático y cambios dietéticos',
    medications: [
      {
        name: 'Omeprazol',
        dosage: '20mg',
        frequency: '1 vez al día',
        duration: '14 días',
        instructions: 'Tomar 30 minutos antes del desayuno'
      },
      {
        name: 'Domperidona',
        dosage: '10mg',
        frequency: '3 veces al día',
        duration: '7 días',
        instructions: 'Tomar antes de las comidas'
      }
    ],
    vitalSigns: {
      bloodPressure: '110/70',
      heartRate: 78,
      temperature: 36.8,
      weight: 58
    },
    notes: 'Evitar alimentos irritantes, cafeína y alcohol. Control en 2 semanas.',
    status: 'active',
    createdAt: '2025-10-12T09:15:00Z',
    updatedAt: '2025-10-12T09:45:00Z'
  },
  {
    id: 'entry_007',
    consultationDate: '2025-09-20',
    consultationTime: '11:00',
    doctor: 'Dr. Miguel Herrera',
    specialty: 'clinica-medica',
    type: 'checkup',
    chiefComplaint: 'Control médico anual',
    symptoms: 'Asintomática',
    physicalExam: 'Examen físico normal',
    diagnosis: 'Estado de salud normal',
    treatment: 'Medidas preventivas',
    vitalSigns: {
      bloodPressure: '115/75',
      heartRate: 72,
      temperature: 36.6,
      weight: 59,
      height: 162
    },
    labResults: [
      {
        id: 'lab_001',
        testName: 'Hemograma completo',
        result: 'Normal',
        normalRange: 'Valores dentro de rangos normales',
        date: '2025-09-18'
      },
      {
        id: 'lab_002',
        testName: 'Perfil lipídico',
        result: 'Colesterol total: 180 mg/dl',
        normalRange: '<200 mg/dl',
        date: '2025-09-18'
      }
    ],
    notes: 'Paciente en excelente estado de salud. Continuar con estilo de vida saludable.',
    status: 'completed',
    createdAt: '2025-09-20T11:00:00Z',
    updatedAt: '2025-09-20T11:30:00Z'
  },

  // Registros para Carlos Eduardo Vargas (Traumatología)
  {
    id: 'entry_008',
    consultationDate: '2025-10-14',
    consultationTime: '16:00',
    doctor: 'Dr. Fernando López',
    specialty: 'traumatologia',
    type: 'followup',
    chiefComplaint: 'Control post-operatorio fractura de tibia',
    symptoms: 'Leve dolor en sitio de fractura',
    physicalExam: 'Herida quirúrgica en buen estado, sin signos de infección',
    diagnosis: 'Fractura de tibia en consolidación',
    treatment: 'Fisioterapia y control radiológico',
    medications: [
      {
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Cada 8 horas si hay dolor',
        duration: '15 días'
      }
    ],
    vitalSigns: {
      bloodPressure: '130/80',
      heartRate: 75,
      temperature: 36.7,
      weight: 82
    },
    diagnosticImages: [
      {
        id: 'img_002',
        name: 'RX_tibia_control.jpg',
        description: 'Radiografía de tibia - Control post-operatorio',
        type: 'radiografia',
        url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800',
        uploadDate: '2025-10-14T16:15:00Z'
      }
    ],
    nextAppointment: {
      date: '2025-11-14',
      time: '16:00',
      reason: 'Control radiológico'
    },
    notes: 'Evolución favorable. Continuar con fisioterapia.',
    status: 'active',
    createdAt: '2025-10-14T16:00:00Z',
    updatedAt: '2025-10-14T16:45:00Z'
  },
  {
    id: 'entry_009',
    consultationDate: '2025-09-01',
    consultationTime: '10:30',
    doctor: 'Dr. Fernando López',
    specialty: 'traumatologia',
    type: 'emergency',
    chiefComplaint: 'Trauma en pierna derecha por accidente',
    symptoms: 'Dolor intenso, imposibilidad para caminar',
    physicalExam: 'Deformidad evidente en tercio medio de tibia',
    diagnosis: 'Fractura de tibia derecha',
    treatment: 'Reducción abierta y fijación interna',
    vitalSigns: {
      bloodPressure: '140/85',
      heartRate: 95,
      temperature: 37.0,
      weight: 82
    },
    diagnosticImages: [
      {
        id: 'img_003',
        name: 'RX_tibia_inicial.jpg',
        description: 'Radiografía inicial - Fractura de tibia',
        type: 'radiografia',
        url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800',
        uploadDate: '2025-09-01T10:45:00Z'
      }
    ],
    notes: 'Fractura tratada quirúrgicamente. Evolución esperada.',
    status: 'completed',
    createdAt: '2025-09-01T10:30:00Z',
    updatedAt: '2025-09-01T14:00:00Z'
  },

  // Registros para Isabella Ramírez (Pediatría)
  {
    id: 'entry_010',
    consultationDate: '2025-10-11',
    consultationTime: '09:30',
    doctor: 'Dra. Carmen Silva',
    specialty: 'pediatria',
    type: 'checkup',
    chiefComplaint: 'Control de crecimiento y desarrollo',
    symptoms: 'Asintomática',
    physicalExam: 'Desarrollo psicomotor acorde para la edad',
    diagnosis: 'Crecimiento y desarrollo normal',
    treatment: 'Continuar con controles regulares',
    vitalSigns: {
      bloodPressure: '95/60',
      heartRate: 90,
      temperature: 36.8,
      weight: 32,
      height: 140
    },
    notes: 'Niña sana. Vacuna triple viral aplicada. Próximo control en 6 meses.',
    status: 'completed',
    createdAt: '2025-10-11T09:30:00Z',
    updatedAt: '2025-10-11T10:00:00Z'
  },
  {
    id: 'entry_011',
    consultationDate: '2025-08-15',
    consultationTime: '14:00',
    doctor: 'Dra. Carmen Silva',
    specialty: 'pediatria',
    type: 'consultation',
    chiefComplaint: 'Fiebre y dolor de garganta',
    symptoms: 'Fiebre de 38.5°C, dolor al tragar, malestar general',
    physicalExam: 'Faringe eritematosa, ganglios cervicales palpables',
    diagnosis: 'Faringitis viral',
    treatment: 'Tratamiento sintomático',
    medications: [
      {
        name: 'Paracetamol',
        dosage: '250mg',
        frequency: 'Cada 6 horas',
        duration: '5 días',
        instructions: 'Solo si hay fiebre >38°C'
      }
    ],
    vitalSigns: {
      bloodPressure: '90/55',
      heartRate: 105,
      temperature: 38.5,
      weight: 31
    },
    notes: 'Cuadro viral autolimitado. Control si persisten síntomas.',
    status: 'completed',
    createdAt: '2025-08-15T14:00:00Z',
    updatedAt: '2025-08-15T14:30:00Z'
  },

  // Registros para Roberto Silva (Neurología)
  {
    id: 'entry_012',
    consultationDate: '2025-10-13',
    consultationTime: '11:45',
    doctor: 'Dr. Andrés Morales',
    specialty: 'neurologia',
    type: 'followup',
    chiefComplaint: 'Control de migraña',
    symptoms: 'Episodios de cefalea menos frecuentes',
    physicalExam: 'Examen neurológico normal',
    diagnosis: 'Migraña en tratamiento profiláctico',
    treatment: 'Continuar con tratamiento preventivo',
    medications: [
      {
        name: 'Topiramato',
        dosage: '50mg',
        frequency: '2 veces al día',
        duration: '90 días'
      }
    ],
    vitalSigns: {
      bloodPressure: '125/80',
      heartRate: 68,
      weight: 78
    },
    notes: 'Buena respuesta al tratamiento. Continuar por 3 meses más.',
    status: 'active',
    createdAt: '2025-10-13T11:45:00Z',
    updatedAt: '2025-10-13T12:15:00Z'
  },
  {
    id: 'entry_013',
    consultationDate: '2025-07-20',
    consultationTime: '10:15',
    doctor: 'Dr. Andrés Morales',
    specialty: 'neurologia',
    type: 'consultation',
    chiefComplaint: 'Cefaleas recurrentes',
    symptoms: 'Dolor de cabeza pulsátil, náuseas, sensibilidad a la luz',
    physicalExam: 'Examen neurológico sin alteraciones',
    diagnosis: 'Migraña sin aura',
    treatment: 'Tratamiento profiláctico',
    medications: [
      {
        name: 'Topiramato',
        dosage: '25mg',
        frequency: '2 veces al día',
        duration: '30 días'
      }
    ],
    diagnosticImages: [
      {
        id: 'img_004',
        name: 'RMN_cerebro.jpg',
        description: 'Resonancia magnética cerebral - Normal',
        type: 'resonancia',
        url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800',
        uploadDate: '2025-07-20T10:30:00Z'
      }
    ],
    notes: 'Iniciar tratamiento preventivo y controles mensuales.',
    status: 'completed',
    createdAt: '2025-07-20T10:15:00Z',
    updatedAt: '2025-07-20T11:00:00Z'
  },

  // Registros para Daniela Torres (Ginecología)
  {
    id: 'entry_014',
    consultationDate: '2025-10-16',
    consultationTime: '15:00',
    doctor: 'Dra. Mónica Herrera',
    specialty: 'ginecologia',
    type: 'checkup',
    chiefComplaint: 'Control ginecológico anual',
    symptoms: 'Asintomática',
    physicalExam: 'Examen ginecológico normal',
    diagnosis: 'Estado ginecológico normal',
    treatment: 'Continuar con controles anuales',
    vitalSigns: {
      bloodPressure: '110/70',
      heartRate: 75,
      weight: 62,
      height: 168
    },
    labResults: [
      {
        id: 'lab_003',
        testName: 'Citología cervical',
        result: 'Normal',
        normalRange: 'Sin alteraciones',
        date: '2025-10-16'
      }
    ],
    notes: 'Examen normal. Próximo control en 1 año.',
    status: 'completed',
    createdAt: '2025-10-16T15:00:00Z',
    updatedAt: '2025-10-16T15:30:00Z'
  },
  {
    id: 'entry_015',
    consultationDate: '2025-06-10',
    consultationTime: '09:45',
    doctor: 'Dra. Mónica Herrera',
    specialty: 'ginecologia',
    type: 'consultation',
    chiefComplaint: 'Irregularidades menstruales',
    symptoms: 'Ciclos menstruales irregulares, sangrado abundante',
    physicalExam: 'Útero de tamaño normal, ovarios no palpables',
    diagnosis: 'Síndrome de ovarios poliquísticos',
    treatment: 'Anticonceptivos orales y cambios en estilo de vida',
    medications: [
      {
        name: 'Anticonceptivo oral combinado',
        dosage: '1 tableta',
        frequency: '1 vez al día',
        duration: '3 meses',
        instructions: 'Tomar a la misma hora cada día'
      }
    ],
    labResults: [
      {
        id: 'lab_004',
        testName: 'Perfil hormonal',
        result: 'LH elevada, relación LH/FSH aumentada',
        normalRange: 'LH: 2-15 mU/ml',
        date: '2025-06-08'
      }
    ],
    notes: 'Control en 3 meses para evaluar respuesta al tratamiento.',
    status: 'completed',
    createdAt: '2025-06-10T09:45:00Z',
    updatedAt: '2025-06-10T10:30:00Z'
  }
];

// Historias clínicas completas de muestra
export const sampleMedicalRecords: MedicalRecord[] = [
  {
    id: 'record_001',
    patientId: 'pat_001',
    patient: samplePatients[0],
    entries: [
      sampleMedicalEntries[0], // entry_001 - Oct 15
      sampleMedicalEntries[1], // entry_002 - Sep 15
      sampleMedicalEntries[2]  // entry_003 - Aug 15
    ],
    allergies: ['Penicilina', 'Mariscos'],
    chronicConditions: ['Hipertensión arterial'],
    familyHistory: [
      {
        condition: 'Diabetes tipo 2',
        relationship: 'Madre',
        notes: 'Diagnosticada a los 55 años'
      },
      {
        condition: 'Hipertensión',
        relationship: 'Padre',
        notes: 'Controlada con medicación'
      }
    ],
    socialHistory: {
      smoking: 'never',
      alcohol: 'occasional',
      exercise: 'light',
      occupation: 'Contadora'
    },
    emergencyContacts: [
      {
        name: 'Carlos González',
        relationship: 'Esposo',
        phone: '3007654321',
        email: 'carlos.gonzalez@email.com'
      }
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2025-10-15T14:30:00Z'
  },
  {
    id: 'record_002',
    patientId: 'pat_002',
    patient: samplePatients[1],
    entries: [
      sampleMedicalEntries[3], // entry_004 - Oct 10
      sampleMedicalEntries[4]  // entry_005 - Jul 15
    ],
    allergies: [],
    chronicConditions: [],
    socialHistory: {
      smoking: 'never',
      alcohol: 'moderate',
      exercise: 'moderate',
      occupation: 'Ingeniero'
    },
    emergencyContacts: [
      {
        name: 'Ana Rodríguez',
        relationship: 'Madre',
        phone: '3001111111'
      }
    ],
    createdAt: '2024-03-10T09:00:00Z',
    updatedAt: '2025-10-10T11:00:00Z'
  },
  {
    id: 'record_003',
    patientId: 'pat_003',
    patient: samplePatients[2],
    entries: [
      sampleMedicalEntries[5], // entry_006 - Oct 12
      sampleMedicalEntries[6]  // entry_007 - Sep 20
    ],
    allergies: ['Ibuprofeno'],
    chronicConditions: [],
    socialHistory: {
      smoking: 'never',
      alcohol: 'never',
      exercise: 'active',
      occupation: 'Diseñadora Gráfica'
    },
    emergencyContacts: [
      {
        name: 'Luis Martínez',
        relationship: 'Padre',
        phone: '3002222222'
      }
    ],
    createdAt: '2024-05-20T16:00:00Z',
    updatedAt: '2025-10-12T10:15:00Z'
  },
  {
    id: 'record_004',
    patientId: 'pat_004',
    patient: samplePatients[3],
    entries: [
      sampleMedicalEntries[7], // entry_008 - Oct 14
      sampleMedicalEntries[8]  // entry_009 - Sep 01
    ],
    allergies: ['Sulfonamidas'],
    chronicConditions: [],
    surgicalHistory: [
      {
        procedure: 'Reducción abierta y fijación interna de tibia',
        date: '2025-09-01',
        surgeon: 'Dr. Fernando López',
        complications: 'Ninguna'
      }
    ],
    socialHistory: {
      smoking: 'former',
      alcohol: 'moderate',
      exercise: 'light',
      occupation: 'Contador'
    },
    emergencyContacts: [
      {
        name: 'Mercedes Vargas',
        relationship: 'Esposa',
        phone: '3004444444'
      }
    ],
    createdAt: '2024-02-28T14:00:00Z',
    updatedAt: '2025-10-14T16:20:00Z'
  },
  {
    id: 'record_005',
    patientId: 'pat_005',
    patient: samplePatients[4],
    entries: [
      sampleMedicalEntries[9],  // entry_010 - Oct 11
      sampleMedicalEntries[10]  // entry_011 - Aug 15
    ],
    allergies: ['Frutos secos'],
    chronicConditions: [],
    socialHistory: {
      smoking: 'never',
      alcohol: 'never',
      exercise: 'active',
      occupation: 'Estudiante'
    },
    emergencyContacts: [
      {
        name: 'Patricia Ramírez',
        relationship: 'Madre',
        phone: '3007777777'
      }
    ],
    createdAt: '2024-04-15T11:30:00Z',
    updatedAt: '2025-10-11T09:45:00Z'
  },
  {
    id: 'record_006',
    patientId: 'pat_006',
    patient: samplePatients[5],
    entries: [
      sampleMedicalEntries[11], // entry_012 - Oct 13
      sampleMedicalEntries[12]  // entry_013 - Jul 20
    ],
    allergies: ['Aspirina'],
    chronicConditions: ['Migraña'],
    familyHistory: [
      {
        condition: 'Migraña',
        relationship: 'Madre',
        notes: 'Historia familiar de migraña'
      }
    ],
    socialHistory: {
      smoking: 'never',
      alcohol: 'occasional',
      exercise: 'moderate',
      occupation: 'Abogado'
    },
    emergencyContacts: [
      {
        name: 'Carmen Silva',
        relationship: 'Esposa',
        phone: '3009999999'
      }
    ],
    createdAt: '2024-01-20T08:15:00Z',
    updatedAt: '2025-10-13T12:00:00Z'
  },
  {
    id: 'record_007',
    patientId: 'pat_007',
    patient: samplePatients[6],
    entries: [
      sampleMedicalEntries[13], // entry_014 - Oct 16
      sampleMedicalEntries[14]  // entry_015 - Jun 10
    ],
    allergies: [],
    chronicConditions: ['Síndrome de ovarios poliquísticos'],
    socialHistory: {
      smoking: 'never',
      alcohol: 'occasional',
      exercise: 'active',
      occupation: 'Arquitecta'
    },
    emergencyContacts: [
      {
        name: 'Miguel Torres',
        relationship: 'Padre',
        phone: '3002020202'
      }
    ],
    createdAt: '2024-06-10T13:45:00Z',
    updatedAt: '2025-10-16T15:30:00Z'
  }
];