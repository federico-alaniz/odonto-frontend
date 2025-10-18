import { Bill } from './fake-data-types';

export const bills: Bill[] = [
  {
    id: 'bill_001',
    patientId: 'pat_001',
    appointmentId: 'apt_001',
    medicalRecordId: 'med_001',
    fecha: '2025-10-18',
    conceptos: [
      {
        descripcion: 'Consulta médica - Clínica médica',
        cantidad: 1,
        precioUnitario: 15000,
        total: 15000
      },
      {
        descripcion: 'Control de presión arterial',
        cantidad: 1,
        precioUnitario: 3000,
        total: 3000
      }
    ],
    subtotal: 18000,
    descuentos: 1800, // 10% descuento obra social
    impuestos: 0,
    total: 16200,
    metodoPago: 'seguro',
    estado: 'pagado',
    fechaVencimiento: '2025-10-25',
    fechaPago: '2025-10-18',
    notas: 'Cobertura OSDE 100% - Copago paciente',
    creadoPor: 'user_sec_001'
  },
  {
    id: 'bill_002',
    patientId: 'pat_008',
    appointmentId: 'apt_005',
    medicalRecordId: 'med_002',
    fecha: '2025-10-18',
    conceptos: [
      {
        descripcion: 'Consulta traumatológica',
        cantidad: 1,
        precioUnitario: 18000,
        total: 18000
      },
      {
        descripcion: 'Control post-fractura',
        cantidad: 1,
        precioUnitario: 5000,
        total: 5000
      },
      {
        descripcion: 'Radiografía control',
        cantidad: 1,
        precioUnitario: 8000,
        total: 8000
      }
    ],
    subtotal: 31000,
    descuentos: 0,
    impuestos: 0,
    total: 31000,
    metodoPago: 'efectivo',
    estado: 'pagado',
    fechaVencimiento: '2025-10-25',
    fechaPago: '2025-10-18',
    creadoPor: 'user_sec_003'
  },
  {
    id: 'bill_003',
    patientId: 'pat_004',
    medicalRecordId: 'med_003',
    fecha: '2025-10-13',
    conceptos: [
      {
        descripcion: 'Consulta cardiológica',
        cantidad: 1,
        precioUnitario: 25000,
        total: 25000
      },
      {
        descripcion: 'Electrocardiograma',
        cantidad: 1,
        precioUnitario: 7000,
        total: 7000
      },
      {
        descripcion: 'Control diabetológico',
        cantidad: 1,
        precioUnitario: 8000,
        total: 8000
      }
    ],
    subtotal: 40000,
    descuentos: 4000, // 10% descuento por pago anticipado
    impuestos: 0,
    total: 36000,
    metodoPago: 'tarjeta',
    estado: 'pagado',
    fechaVencimiento: '2025-10-20',
    fechaPago: '2025-10-13',
    notas: 'Descuento por pago al contado',
    creadoPor: 'user_sec_001'
  },
  {
    id: 'bill_004',
    patientId: 'pat_005',
    appointmentId: 'apt_003',
    medicalRecordId: 'med_004',
    fecha: '2025-10-10',
    conceptos: [
      {
        descripcion: 'Consulta pediátrica',
        cantidad: 1,
        precioUnitario: 12000,
        total: 12000
      },
      {
        descripcion: 'Control de crecimiento',
        cantidad: 1,
        precioUnitario: 3000,
        total: 3000
      }
    ],
    subtotal: 15000,
    descuentos: 12000, // 80% cobertura IOMA
    impuestos: 0,
    total: 3000,
    metodoPago: 'seguro',
    estado: 'pagado',
    fechaVencimiento: '2025-10-17',
    fechaPago: '2025-10-10',
    notas: 'Cobertura IOMA - Copago mínimo',
    creadoPor: 'user_sec_002'
  },
  {
    id: 'bill_005',
    patientId: 'pat_007',
    medicalRecordId: 'med_005',
    fecha: '2025-10-15',
    conceptos: [
      {
        descripcion: 'Consulta ginecológica',
        cantidad: 1,
        precioUnitario: 20000,
        total: 20000
      },
      {
        descripcion: 'Control anemia',
        cantidad: 1,
        precioUnitario: 5000,
        total: 5000
      },
      {
        descripcion: 'Hemograma completo',
        cantidad: 1,
        precioUnitario: 6000,
        total: 6000
      }
    ],
    subtotal: 31000,
    descuentos: 18600, // 60% cobertura Galeno
    impuestos: 0,
    total: 12400,
    metodoPago: 'seguro',
    estado: 'pagado',
    fechaVencimiento: '2025-10-22',
    fechaPago: '2025-10-15',
    notas: 'Cobertura Galeno',
    creadoPor: 'user_sec_003'
  },
  {
    id: 'bill_006',
    patientId: 'pat_006',
    medicalRecordId: 'med_006',
    fecha: '2025-10-12',
    conceptos: [
      {
        descripcion: 'Consulta clínica médica',
        cantidad: 1,
        precioUnitario: 15000,
        total: 15000
      },
      {
        descripcion: 'Evaluación gastroenterológica',
        cantidad: 1,
        precioUnitario: 8000,
        total: 8000
      }
    ],
    subtotal: 23000,
    descuentos: 0,
    impuestos: 0,
    total: 23000,
    estado: 'pendiente',
    fechaVencimiento: '2025-10-19',
    notas: 'Paciente particular - Sin obra social',
    creadoPor: 'user_sec_001'
  },
  {
    id: 'bill_007',
    patientId: 'pat_002',
    appointmentId: 'apt_004',
    medicalRecordId: 'med_007',
    fecha: '2025-10-09',
    conceptos: [
      {
        descripcion: 'Consulta odontológica',
        cantidad: 1,
        precioUnitario: 12000,
        total: 12000
      },
      {
        descripcion: 'Limpieza dental profunda',
        cantidad: 1,
        precioUnitario: 15000,
        total: 15000
      },
      {
        descripcion: 'Aplicación de flúor',
        cantidad: 1,
        precioUnitario: 4000,
        total: 4000
      }
    ],
    subtotal: 31000,
    descuentos: 0,
    impuestos: 0,
    total: 31000,
    estado: 'pendiente',
    fechaVencimiento: '2025-10-23',
    notas: 'Pendiente de pago - Recordatorio enviado',
    creadoPor: 'user_sec_001'
  },
  {
    id: 'bill_008',
    patientId: 'pat_009',
    medicalRecordId: 'med_008',
    fecha: '2025-10-16',
    conceptos: [
      {
        descripcion: 'Consulta cardiológica geriátrica',
        cantidad: 1,
        precioUnitario: 25000,
        total: 25000
      },
      {
        descripcion: 'Electrocardiograma',
        cantidad: 1,
        precioUnitario: 7000,
        total: 7000
      },
      {
        descripcion: 'Ecocardiograma',
        cantidad: 1,
        precioUnitario: 18000,
        total: 18000
      }
    ],
    subtotal: 50000,
    descuentos: 47500, // 95% cobertura PAMI
    impuestos: 0,
    total: 2500,
    metodoPago: 'seguro',
    estado: 'pagado',
    fechaVencimiento: '2025-10-23',
    fechaPago: '2025-10-16',
    notas: 'Cobertura PAMI adulto mayor',
    creadoPor: 'user_sec_001'
  },
  {
    id: 'bill_009',
    patientId: 'pat_010',
    medicalRecordId: 'med_009',
    fecha: '2025-10-17',
    conceptos: [
      {
        descripcion: 'Consulta odontológica preventiva',
        cantidad: 1,
        precioUnitario: 10000,
        total: 10000
      },
      {
        descripcion: 'Limpieza dental',
        cantidad: 1,
        precioUnitario: 8000,
        total: 8000
      }
    ],
    subtotal: 18000,
    descuentos: 0,
    impuestos: 0,
    total: 18000,
    metodoPago: 'transferencia',
    estado: 'pagado',
    fechaVencimiento: '2025-10-24',
    fechaPago: '2025-10-17',
    creadoPor: 'user_sec_002'
  },
  {
    id: 'bill_010',
    patientId: 'pat_003',
    medicalRecordId: 'med_010',
    fecha: '2025-10-11',
    conceptos: [
      {
        descripcion: 'Consulta por urgencia - Asma',
        cantidad: 1,
        precioUnitario: 18000,
        total: 18000
      },
      {
        descripcion: 'Nebulización',
        cantidad: 1,
        precioUnitario: 5000,
        total: 5000
      },
      {
        descripcion: 'Medicación de urgencia',
        cantidad: 1,
        precioUnitario: 3000,
        total: 3000
      }
    ],
    subtotal: 26000,
    descuentos: 15600, // 60% cobertura Swiss Medical
    impuestos: 0,
    total: 10400,
    estado: 'vencido',
    fechaVencimiento: '2025-10-18',
    notas: 'Factura vencida - Contactar paciente',
    creadoPor: 'user_sec_001'
  },
  
  // Facturas programadas (futuras)
  {
    id: 'bill_011',
    patientId: 'pat_004',
    appointmentId: 'apt_006',
    fecha: '2025-10-19',
    conceptos: [
      {
        descripcion: 'Consulta cardiológica',
        cantidad: 1,
        precioUnitario: 25000,
        total: 25000
      }
    ],
    subtotal: 25000,
    descuentos: 0,
    impuestos: 0,
    total: 25000,
    estado: 'pendiente',
    fechaVencimiento: '2025-10-26',
    notas: 'Factura generada automáticamente',
    creadoPor: 'user_sec_001'
  },
  {
    id: 'bill_012',
    patientId: 'pat_002',
    appointmentId: 'apt_014',
    fecha: '2025-11-09',
    conceptos: [
      {
        descripcion: 'Cirugía oral - Extracción molar',
        cantidad: 1,
        precioUnitario: 45000,
        total: 45000
      },
      {
        descripcion: 'Anestesia local',
        cantidad: 1,
        precioUnitario: 8000,
        total: 8000
      },
      {
        descripcion: 'Medicación post-operatoria',
        cantidad: 1,
        precioUnitario: 5000,
        total: 5000
      }
    ],
    subtotal: 58000,
    descuentos: 0,
    impuestos: 0,
    total: 58000,
    estado: 'pendiente',
    fechaVencimiento: '2025-11-16',
    notas: 'Procedimiento programado - Factura estimada',
    creadoPor: 'user_sec_001'
  }
];

// Funciones helper para manejo de facturas
export const getBillById = (id: string): Bill | undefined => {
  return bills.find(bill => bill.id === id);
};

export const getBillsByPatient = (patientId: string): Bill[] => {
  return bills.filter(bill => bill.patientId === patientId)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
};

export const getBillsByStatus = (estado: Bill['estado']): Bill[] => {
  return bills.filter(bill => bill.estado === estado);
};

export const getBillsByDateRange = (startDate: string, endDate: string): Bill[] => {
  return bills.filter(bill => {
    return bill.fecha >= startDate && bill.fecha <= endDate;
  });
};

export const getPendingBills = (): Bill[] => {
  return bills.filter(bill => bill.estado === 'pendiente');
};

export const getOverdueBills = (): Bill[] => {
  const today = '2025-10-18';
  return bills.filter(bill => 
    bill.estado === 'pendiente' && bill.fechaVencimiento < today
  );
};

export const getRevenueByDateRange = (startDate: string, endDate: string): number => {
  const paidBills = bills.filter(bill => 
    bill.estado === 'pagado' && 
    bill.fechaPago && 
    bill.fechaPago >= startDate && 
    bill.fechaPago <= endDate
  );
  
  return paidBills.reduce((total, bill) => total + bill.total, 0);
};

export const getBillsByPaymentMethod = (metodoPago: Bill['metodoPago']): Bill[] => {
  return bills.filter(bill => bill.metodoPago === metodoPago);
};

export const getMonthlyRevenue = (year: number, month: number): number => {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
  return getRevenueByDateRange(startDate, endDate);
};

export const getBillsStatistics = () => {
  const total = bills.length;
  const paid = bills.filter(b => b.estado === 'pagado').length;
  const pending = bills.filter(b => b.estado === 'pendiente').length;
  const overdue = bills.filter(b => b.estado === 'vencido').length;
  
  const totalRevenue = bills
    .filter(b => b.estado === 'pagado')
    .reduce((sum, b) => sum + b.total, 0);
  
  const pendingAmount = bills
    .filter(b => b.estado === 'pendiente')
    .reduce((sum, b) => sum + b.total, 0);
  
  return {
    total,
    paid,
    pending,
    overdue,
    totalRevenue,
    pendingAmount,
    collectionRate: total > 0 ? (paid / total) * 100 : 0
  };
};