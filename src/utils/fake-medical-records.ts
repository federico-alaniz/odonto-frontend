import { MedicalRecord } from './fake-data-types';

export const medicalRecords: MedicalRecord[] = [
  // Registros médicos recientes
  {
    id: 'med_001',
    patientId: 'pat_001',
    appointmentId: 'apt_001',
    doctorId: 'user_doc_001',
    fecha: '2025-10-18',
    especialidad: 'clinica-medica',
    tipo: 'control',
    motivoConsulta: 'Control de hipertensión arterial',
    sintomas: 'Paciente asintomática, refiere adherencia al tratamiento antihipertensivo',
    examenFisico: 'Paciente en buen estado general. TA: 130/80 mmHg. FC: 72 lpm. Peso: 68 kg. Auscultación cardiopulmonar normal.',
    diagnostico: 'Hipertensión arterial esencial controlada',
    tratamiento: 'Continuar con Losartán 50mg una vez al día. Mantener dieta hiposódica y actividad física regular.',
    medicamentos: [
      {
        nombre: 'Losartán',
        dosis: '50mg',
        frecuencia: '1 vez al día',
        duracion: '3 meses',
        instrucciones: 'Tomar en ayunas por la mañana'
      }
    ],
    signosVitales: {
      presionArterial: '130/80',
      frecuenciaCardiaca: 72,
      temperatura: 36.5,
      peso: 68,
      altura: 165,
      saturacionOxigeno: 98
    },
    proximaConsulta: {
      fecha: '2025-12-18',
      motivo: 'Control de presión arterial'
    },
    estado: 'finalizado',
    fechaCreacion: '2025-10-18T09:30:00Z'
  },
  {
    id: 'med_002',
    patientId: 'pat_008',
    appointmentId: 'apt_005',
    doctorId: 'user_doc_005',
    fecha: '2025-10-18',
    especialidad: 'traumatologia',
    tipo: 'control',
    motivoConsulta: 'Control post-fractura de tibia',
    sintomas: 'Paciente refiere mejoría del dolor, camina sin dificultad con el yeso',
    examenFisico: 'Yeso en buenas condiciones. No signos de infección. Dedos con buena coloración y movilidad. No edema.',
    diagnostico: 'Fractura de tibia en consolidación, evolución favorable',
    tratamiento: 'Retirar yeso en 2 semanas. Iniciar fisioterapia posterior al retiro del yeso.',
    medicamentos: [
      {
        nombre: 'Ibuprofeno',
        dosis: '400mg',
        frecuencia: 'cada 8 horas si hay dolor',
        duracion: '1 semana',
        instrucciones: 'Tomar con las comidas'
      }
    ],
    signosVitales: {
      presionArterial: '120/75',
      frecuenciaCardiaca: 68,
      temperatura: 36.2,
      peso: 75
    },
    proximaConsulta: {
      fecha: '2025-11-01',
      motivo: 'Retiro de yeso y evaluación'
    },
    estado: 'finalizado',
    fechaCreacion: '2025-10-18T11:30:00Z'
  },
  {
    id: 'med_003',
    patientId: 'pat_004',
    doctorId: 'user_doc_004',
    fecha: '2025-10-13',
    especialidad: 'cardiologia',
    tipo: 'control',
    motivoConsulta: 'Control de diabetes tipo 2 y riesgo cardiovascular',
    sintomas: 'Paciente refiere buen control glucémico, sin síntomas cardiovasculares',
    examenFisico: 'Buen estado general. TA: 125/78 mmHg. FC: 75 lpm. IMC: 28.5. Auscultación cardíaca normal.',
    diagnostico: 'Diabetes mellitus tipo 2 controlada. Dislipidemia en tratamiento.',
    tratamiento: 'Continuar con metformina y atorvastatina. Reforzar dieta y ejercicio. Solicitar laboratorio de control.',
    medicamentos: [
      {
        nombre: 'Metformina',
        dosis: '850mg',
        frecuencia: '2 veces al día',
        duracion: '3 meses',
        instrucciones: 'Tomar con el desayuno y cena'
      },
      {
        nombre: 'Atorvastatina',
        dosis: '20mg',
        frecuencia: '1 vez al día',
        duracion: '3 meses',
        instrucciones: 'Tomar por la noche'
      }
    ],
    signosVitales: {
      presionArterial: '125/78',
      frecuenciaCardiaca: 75,
      temperatura: 36.3,
      peso: 82,
      altura: 170
    },
    proximaConsulta: {
      fecha: '2025-01-13',
      motivo: 'Control con resultados de laboratorio'
    },
    estado: 'finalizado',
    fechaCreacion: '2025-10-13T10:00:00Z'
  },
  {
    id: 'med_004',
    patientId: 'pat_005',
    doctorId: 'user_doc_003',
    fecha: '2025-10-10',
    especialidad: 'pediatria',
    tipo: 'control',
    motivoConsulta: 'Control de crecimiento y desarrollo - 10 años',
    sintomas: 'Niña activa, sin síntomas. Desarrollo normal para la edad',
    examenFisico: 'Niña en excelente estado general. Peso: 32 kg (percentil 50). Talla: 140 cm (percentil 60). Desarrollo puberal normal.',
    diagnostico: 'Crecimiento y desarrollo normal para la edad',
    tratamiento: 'Continuar con alimentación balanceada y actividad física. Vacunación al día.',
    medicamentos: [],
    signosVitales: {
      presionArterial: '95/60',
      frecuenciaCardiaca: 88,
      temperatura: 36.4,
      peso: 32,
      altura: 140
    },
    proximaConsulta: {
      fecha: '2026-04-10',
      motivo: 'Control anual de crecimiento'
    },
    estado: 'finalizado',
    fechaCreacion: '2025-10-10T15:30:00Z'
  },
  {
    id: 'med_005',
    patientId: 'pat_007',
    doctorId: 'user_doc_006',
    fecha: '2025-10-15',
    especialidad: 'ginecologia',
    tipo: 'consulta',
    motivoConsulta: 'Control de anemia ferropénica',
    sintomas: 'Paciente refiere mayor energía, menos fatiga desde inicio del tratamiento con hierro',
    examenFisico: 'Palidez cutáneo-mucosa leve mejorada. Conjuntivas menos pálidas. Resto del examen normal.',
    diagnostico: 'Anemia ferropénica en tratamiento, evolución favorable',
    tratamiento: 'Continuar suplementación con hierro por 2 meses más. Control de laboratorio en 1 mes.',
    medicamentos: [
      {
        nombre: 'Sulfato ferroso',
        dosis: '300mg',
        frecuencia: '1 vez al día',
        duracion: '2 meses',
        instrucciones: 'Tomar en ayunas con vitamina C'
      },
      {
        nombre: 'Anticonceptivos orales',
        dosis: 'según indicación',
        frecuencia: '1 vez al día',
        duracion: 'continuo',
        instrucciones: 'Tomar siempre a la misma hora'
      }
    ],
    signosVitales: {
      presionArterial: '110/70',
      frecuenciaCardiaca: 78,
      temperatura: 36.3,
      peso: 58,
      altura: 162
    },
    proximaConsulta: {
      fecha: '2025-11-15',
      motivo: 'Control de laboratorio y evolución anemia'
    },
    estado: 'finalizado',
    fechaCreacion: '2025-10-15T11:00:00Z'
  },
  {
    id: 'med_006',
    patientId: 'pat_006',
    doctorId: 'user_doc_001',
    fecha: '2025-10-12',
    especialidad: 'clinica-medica',
    tipo: 'consulta',
    motivoConsulta: 'Dolor epigástrico y acidez',
    sintomas: 'Dolor en epigastrio de 1 semana de evolución, acidez, especialmente después de comidas',
    examenFisico: 'Abdomen blando, dolor a la palpación en epigastrio. No signos de irritación peritoneal.',
    diagnostico: 'Gastritis aguda. Probable exacerbación de gastritis crónica conocida.',
    tratamiento: 'Dieta blanda, evitar irritantes. Omeprazol. Control en 2 semanas si persisten síntomas.',
    medicamentos: [
      {
        nombre: 'Omeprazol',
        dosis: '20mg',
        frecuencia: '1 vez al día',
        duracion: '4 semanas',
        instrucciones: 'Tomar en ayunas, 30 minutos antes del desayuno'
      }
    ],
    signosVitales: {
      presionArterial: '118/72',
      frecuenciaCardiaca: 70,
      temperatura: 36.1,
      peso: 73,
      altura: 175
    },
    proximaConsulta: {
      fecha: '2025-10-26',
      motivo: 'Control evolución gastritis'
    },
    estado: 'finalizado',
    fechaCreacion: '2025-10-12T14:30:00Z'
  },
  {
    id: 'med_007',
    patientId: 'pat_002',
    doctorId: 'user_doc_002',
    fecha: '2025-10-09',
    especialidad: 'odontologia',
    tipo: 'consulta',
    motivoConsulta: 'Evaluación general odontológica',
    sintomas: 'Sin dolor dental actual. Solicita limpieza y control general',
    examenFisico: 'Dentición en buen estado general. Presencia de sarro. Encías levemente inflamadas. No caries aparentes.',
    diagnostico: 'Gingivitis leve. Acumulación de sarro.',
    tratamiento: 'Limpieza dental profunda realizada. Instrucciones de higiene oral. Control en 6 meses.',
    medicamentos: [
      {
        nombre: 'Enjuague bucal con clorhexidina',
        dosis: '15ml',
        frecuencia: '2 veces al día',
        duracion: '1 semana',
        instrucciones: 'Enjuagar después del cepillado, no enjuagar con agua después'
      }
    ],
    proximaConsulta: {
      fecha: '2026-04-09',
      motivo: 'Control y limpieza semestral'
    },
    estado: 'finalizado',
    fechaCreacion: '2025-10-09T16:30:00Z'
  },
  {
    id: 'med_008',
    patientId: 'pat_009',
    doctorId: 'user_doc_004',
    fecha: '2025-10-16',
    especialidad: 'cardiologia',
    tipo: 'control',
    motivoConsulta: 'Control de hipertensión arterial y dislipidemia en adulto mayor',
    sintomas: 'Paciente estable, sin síntomas cardiovasculares. Refiere adherencia al tratamiento.',
    examenFisico: 'Buen estado general. TA: 140/85 mmHg. FC: 68 lpm. Soplo sistólico grado I/VI. Edemas maleolares leves.',
    diagnostico: 'Hipertensión arterial en tratamiento. Dislipidemia controlada. Insuficiencia cardíaca leve.',
    tratamiento: 'Ajustar dosis de amlodipina. Continuar con resto de medicación. Dieta hiposódica estricta.',
    medicamentos: [
      {
        nombre: 'Amlodipina',
        dosis: '10mg',
        frecuencia: '1 vez al día',
        duracion: '3 meses',
        instrucciones: 'Tomar por la mañana'
      },
      {
        nombre: 'Simvastatina',
        dosis: '20mg',
        frecuencia: '1 vez al día',
        duracion: '3 meses',
        instrucciones: 'Tomar por la noche'
      },
      {
        nombre: 'Ácido acetilsalicílico',
        dosis: '100mg',
        frecuencia: '1 vez al día',
        duracion: 'continuo',
        instrucciones: 'Tomar con el desayuno'
      }
    ],
    signosVitales: {
      presionArterial: '140/85',
      frecuenciaCardiaca: 68,
      temperatura: 36.0,
      peso: 72,
      altura: 158
    },
    proximaConsulta: {
      fecha: '2025-12-16',
      motivo: 'Control cardiovascular'
    },
    estado: 'finalizado',
    fechaCreacion: '2025-10-16T09:00:00Z'
  },
  {
    id: 'med_009',
    patientId: 'pat_010',
    doctorId: 'user_doc_002',
    fecha: '2025-10-17',
    especialidad: 'odontologia',
    tipo: 'consulta',
    motivoConsulta: 'Primera consulta odontológica - paciente joven',
    sintomas: 'Sin dolor dental. Solicita evaluación general',
    examenFisico: 'Dentición completa y en buen estado. Higiene oral adecuada. Encías sanas. No caries.',
    diagnostico: 'Estado dental excelente. Sin patología aparente.',
    tratamiento: 'Limpieza preventiva. Refuerzo de técnicas de higiene oral. Uso de hilo dental.',
    medicamentos: [],
    proximaConsulta: {
      fecha: '2026-04-17',
      motivo: 'Control preventivo semestral'
    },
    estado: 'finalizado',
    fechaCreacion: '2025-10-17T10:30:00Z'
  },
  {
    id: 'med_010',
    patientId: 'pat_003',
    doctorId: 'user_doc_001',
    fecha: '2025-10-11',
    especialidad: 'clinica-medica',
    tipo: 'consulta',
    motivoConsulta: 'Episodio de asma bronquial',
    sintomas: 'Disnea de esfuerzo, tos seca nocturna, sibilancias. Episodio desencadenado por cambio de clima.',
    examenFisico: 'Paciente en regular estado general. Sibilancias difusas a la auscultación. FR: 22 rpm. Sat O2: 94%.',
    diagnostico: 'Exacerbación de asma bronquial alérgica',
    tratamiento: 'Broncodilatadores y corticoides inhalados. Evitar alérgenos conocidos. Plan de acción para crisis.',
    medicamentos: [
      {
        nombre: 'Salbutamol',
        dosis: '2 puff',
        frecuencia: 'cada 6 horas',
        duracion: '1 semana',
        instrucciones: 'Inhalador, agitar antes de usar'
      },
      {
        nombre: 'Budesonida',
        dosis: '2 puff',
        frecuencia: '2 veces al día',
        duracion: '1 mes',
        instrucciones: 'Inhalador de mantenimiento, enjuagar boca después'
      }
    ],
    signosVitales: {
      presionArterial: '115/70',
      frecuenciaCardiaca: 95,
      temperatura: 36.8,
      saturacionOxigeno: 94
    },
    proximaConsulta: {
      fecha: '2025-10-25',
      motivo: 'Control evolución asma'
    },
    estado: 'finalizado',
    fechaCreacion: '2025-10-11T11:45:00Z'
  }
];

// Funciones helper para manejo de registros médicos
export const getMedicalRecordById = (id: string): MedicalRecord | undefined => {
  return medicalRecords.find(record => record.id === id);
};

export const getMedicalRecordsByPatient = (patientId: string): MedicalRecord[] => {
  return medicalRecords.filter(record => record.patientId === patientId)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
};

export const getMedicalRecordsByDoctor = (doctorId: string): MedicalRecord[] => {
  return medicalRecords.filter(record => record.doctorId === doctorId);
};

export const getMedicalRecordsBySpecialty = (especialidad: string): MedicalRecord[] => {
  return medicalRecords.filter(record => record.especialidad === especialidad);
};

export const getMedicalRecordsByDateRange = (startDate: string, endDate: string): MedicalRecord[] => {
  return medicalRecords.filter(record => {
    return record.fecha >= startDate && record.fecha <= endDate;
  });
};

export const getRecentMedicalRecords = (days: number = 30): MedicalRecord[] => {
  const today = new Date('2025-10-18');
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - days);
  
  return medicalRecords.filter(record => {
    const recordDate = new Date(record.fecha);
    return recordDate >= pastDate && recordDate <= today;
  });
};

export const getMedicalRecordsByAppointment = (appointmentId: string): MedicalRecord | undefined => {
  return medicalRecords.find(record => record.appointmentId === appointmentId);
};