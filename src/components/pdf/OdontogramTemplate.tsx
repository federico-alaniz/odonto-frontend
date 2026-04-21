import React from 'react';
import Odontogram, { ToothCondition, ToothSector } from '@/app/historiales/components/Odontogram';
import { ToothProcedure } from '@/services/medicalRecords';
import { formatDocumentNumber } from '@/utils/document-formatters';

export interface OdontogramTemplateProps {
  patientName?: string;
  plan?: string;
  patient?: any;
  consultationDate?: string | Date;
  doctorName?: string;
  doctorMatricula?: string;
  odontogramConditions?: ToothCondition[];
  monthlyProcedures?: (ToothProcedure & { toothNumber?: number })[];
  observaciones?: string;
  odontogramScale?: number;
  printMode?: boolean;
  whiteMode?: boolean; // Nueva opción para modo blanco (Obra Social)
}

export const OdontogramTemplate: React.FC<OdontogramTemplateProps> = ({
  plan = 'colocar el plan de beneficiario',
  patient,
  consultationDate,
  doctorName = 'ODONTOLOGO',
  doctorMatricula = 'NRO DE MATRICULA PROFESIONAL',
  odontogramConditions = [],
  monthlyProcedures = [],
  observaciones = '',
  odontogramScale = 1.8,
  printMode = false,
  whiteMode = false
}) => {
  console.log('OdontogramTemplate - Consultation Data:', {
    patient,
    consultationDate,
    doctorName,
    doctorMatricula,
    odontogramConditions,
    observaciones,
    plan,
    odontogramScale
  });
  const normalizedText = (value: unknown) => {
    if (Array.isArray(value)) return value.filter(Boolean).join(' ').trim();
    if (typeof value === 'string') return value.trim();
    return '';
  };

  const splitTextIntoLines = (text: string, maxCharsPerLine: number = 80): string[] => {
    if (!text) return ['', '', '', ''];
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          let remainingWord = word;
          while (remainingWord.length > maxCharsPerLine) {
            lines.push(remainingWord.substring(0, maxCharsPerLine));
            remainingWord = remainingWord.substring(maxCharsPerLine);
          }
          currentLine = remainingWord;
        }
      }
    }
    if (currentLine) lines.push(currentLine);
    while (lines.length < 4) lines.push('');
    return lines.slice(0, 4);
  };

  const calculateAge = (birthDate: string | Date): number => {
    let birth: Date;
    if (typeof birthDate === 'string') {
      if (birthDate.includes('/')) {
        const parts = birthDate.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts.map(Number);
          birth = new Date(year, month - 1, day);
        } else {
          birth = new Date(birthDate);
        }
      } else {
        birth = new Date(birthDate);
      }
    } else {
      birth = birthDate;
    }
    if (isNaN(birth.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const patientLastName = normalizedText(patient?.apellidos ?? patient?.apellido);
  const patientFirstName = normalizedText(patient?.nombres ?? patient?.nombre);
  const patientFullName =
    patientLastName || patientFirstName
      ? [patientLastName, patientFirstName].filter(Boolean).join(', ')
      : normalizedText(patient?.nombreCompleto);

  const consultationDateObj = (() => {
    const raw = consultationDate ?? new Date();
    const date = raw instanceof Date ? raw : new Date(raw);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  })();
  const consultationMonth = String(consultationDateObj.getMonth() + 1).padStart(2, '0');
  const consultationYear = String(consultationDateObj.getFullYear());

  const patientDniRaw = normalizedText(
    patient?.numeroDocumento ?? patient?.dni ?? patient?.documento ?? patient?.documentNumber
  );
  const patientDni = patientDniRaw ? formatDocumentNumber(patientDniRaw) : '';
  const patientAge = patient?.fechaNacimiento ? calculateAge(patient.fechaNacimiento) : 0;
  
  const patientInsuranceName = normalizedText(
    patient?.obraSocial ?? patient?.prepaga ?? patient?.insurance ?? patient?.insuranceName
  );
  const planText = normalizedText(patient?.planObraSocial);
  const patientInsuranceNumber = normalizedText(
    patient?.numeroAfiliado ?? patient?.numeroObraSocial ?? patient?.numeroAfiliacion ?? patient?.beneficiaryNumber
  );

  const patientAddress = normalizedText(patient?.direccion?.calle) || '---';
  const patientLocality = normalizedText(patient?.direccion?.localidad || patient?.direccion?.ciudad) || '---';
  const patientPhone = normalizedText(patient?.telefono || patient?.celular) || '---';

  const HeaderSection = () => (
    <div className="text-center mb-4">
      <h1 className="text-[16px] font-bold mb-1 uppercase">Registro de Prestaciones Odontológicas</h1>
    </div>
  );

  const PatientInfoTables = () => (
    <>
      <table className="w-full border-collapse border border-black mb-2">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px]">NUMERO DE BENEFICIARIO</th>
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px]">PLAN</th>
          </tr>
        </thead>
        <tbody className="text-[12px]">
          <tr>
            <td className="border border-black px-2 py-2 text-center align-middle">{patientInsuranceNumber || '---'}</td>
            <td className="border border-black px-2 py-2 text-center align-middle">
              {(patientInsuranceName || 'no indicado') + ' - ' + (planText || 'no indicado')}
            </td>
          </tr>
        </tbody>
      </table>
      
      <table className="w-full border-collapse border border-black mb-2">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px] w-[50px]">MES</th>
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px] w-[50px]">AÑO</th>
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px]">APELLIDO Y NOMBRE</th>
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px] w-[50px]">EDAD</th>
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px] w-[80px]">DNI</th>
          </tr>
        </thead>
        <tbody className="text-[12px] font-bold">
          <tr>
            <td className="border border-black px-2 py-2 text-center align-middle">{consultationMonth}</td>
            <td className="border border-black px-2 py-2 text-center align-middle">{consultationYear}</td>
            <td className="border border-black px-2 py-2 text-center align-middle">{patientFullName.toUpperCase()}</td>
            <td className="border border-black px-2 py-2 text-center align-middle">{patientAge || '---'}</td>
            <td className="border border-black px-2 py-2 text-center align-middle">{patientDni}</td>
          </tr>
        </tbody>
      </table>

      {/* <table className="w-full border-collapse border border-black mb-2">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px]">DOMICILIO</th>
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px]">LOCALIDAD</th>
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px]">TELEFONO</th>
          </tr>
        </thead>
        <tbody className="text-[12px]">
          <tr>
            <td className="border border-black px-2 py-2 text-center align-middle">{patientAddress}</td>
            <td className="border border-black px-2 py-2 text-center align-middle">{patientLocality}</td>
            <td className="border border-black px-2 py-2 text-center align-middle">{patientPhone}</td>
          </tr>
        </tbody>
      </table> */}
      
      <table className="w-full border-collapse border border-black mb-2">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px]">ODONTOLOGO</th>
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px]">MATRICULA PROFESIONAL</th>
          </tr>
        </thead>
        <tbody className="text-[12px]">
          <tr>
            <td className="border border-black px-2 py-2 text-center align-middle">{doctorName.toUpperCase()}</td>
            <td className="border border-black px-2 py-2 text-center align-middle">{doctorMatricula}</td>
          </tr>
        </tbody>
      </table>
    </>
  );

  const PatientInfoTables2 = () => (
    <>
      <table className="w-full border-collapse border border-black mb-2">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px]">NUMERO DE BENEFICIARIO</th>
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px]">PLAN</th>
          </tr>
        </thead>
        <tbody className="text-[12px]">
          <tr>
            <td className="border border-black px-2 py-2 text-center align-middle">{patientInsuranceNumber || '---'}</td>
            <td className="border border-black px-2 py-2 text-center align-middle">
              {(patientInsuranceName || 'no indicado') + ' - ' + (planText || 'no indicado')}
            </td>
          </tr>
        </tbody>
      </table>
      
      <table className="w-full border-collapse border border-black mb-2">
        <thead>
          <tr>
            
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px]">APELLIDO Y NOMBRE</th>
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px] w-[50px]">EDAD</th>
          </tr>
        </thead>
        <tbody className="text-[12px] font-bold">
          <tr>
            
            <td className="border border-black px-2 py-2 text-center align-middle">{patientFullName.toUpperCase()}</td>
            <td className="border border-black px-2 py-2 text-center align-middle">{patientAge || '---'}</td>
          </tr>
        </tbody>
      </table>

      <table className="w-full border-collapse border border-black mb-2">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px]">DOMICILIO</th>
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px]">LOCALIDAD</th>
            <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold text-[11px]">TELEFONO</th>
          </tr>
        </thead>
        <tbody className="text-[12px]">
          <tr>
            <td className="border border-black px-2 py-2 text-center align-middle">{patientAddress}</td>
            <td className="border border-black px-2 py-2 text-center align-middle">{patientLocality}</td>
            <td className="border border-black px-2 py-2 text-center align-middle">{patientPhone}</td>
          </tr>
        </tbody>
      </table>
      
      
    </>
  );

  const TreatmentsTable = () => (
    <table className="w-full border-collapse border border-black mb-4">
      <thead className="text-[10px]">
        <tr>
          <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold w-[40px]">DIA</th>
          <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold w-[50px]">PIEZA</th>
          <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold w-[40px]">CARA</th>
          <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold">CODIGO</th>
          <th className="border border-black px-2 py-1 bg-gray-100 text-center align-middle font-bold">CONFORMIDAD</th>
        </tr>
      </thead>
      <tbody className="text-[10px]">
        {(() => {
          const rows = [];
          // Mostrar exactamente 6 filas
          for (let i = 0; i < 6; i++) {
            const proc = monthlyProcedures[i];
            if (proc) {
              const procDate = new Date(proc.date);
              const day = !isNaN(procDate.getTime()) ? String(procDate.getDate()).padStart(2, '0') : '';
              
              // Usar el número de diente si viene en el objeto, sino buscarlo
              const toothNum = proc.toothNumber || odontogramConditions.find(t => 
                t.procedures?.some(p => p.id === proc.id || (p.date === proc.date && p.procedure === proc.procedure))
              )?.number;
              
              let cara = '';
              if (toothNum) {
                // Mapear sector a inicial de cara
                const toothWithSectors = odontogramConditions.find(t => t.number === toothNum);
                if (toothWithSectors?.sectors && toothWithSectors.sectors.length > 0) {
                  const hasR = (s: ToothSector['sector']) =>
                    toothWithSectors.sectors!.some((ts) => ts.sector === s && ts.hasRestoration);
                  const order: ToothSector['sector'][] = ['topUpper', 'topLower', 'bottom', 'left', 'right', 'center'];
                  const initials = Array.from(new Set(order
                    .filter((s) => {
                      if (s === 'center') return hasR('center') || hasR('centerMesial') || hasR('centerDistal');
                      return hasR(s);
                    })
                    .map((s) => {
                      const num = toothNum;
                      const isUpper = (num >= 11 && num <= 28) || (num >= 51 && num <= 65);
                      const lastDigit = num % 10;
                      const isAnterior = [1, 2, 3].includes(lastDigit) || [61, 62, 63, 71, 72, 73].includes(num);

                      switch (s) {
                        case 'left': return 'M';
                        case 'right': return 'D';
                        case 'top': case 'topUpper': case 'topLower': return 'V';
                        case 'bottom': return isUpper ? 'P' : 'L';
                        case 'center': return isAnterior ? 'I' : 'O';
                        default: return '';
                      }
                    })
                    .filter(Boolean)));
                  cara = initials.join(' - ');
                } else if (proc.sector) {
                  const isUpper = (toothNum >= 11 && toothNum <= 28) || (toothNum >= 51 && toothNum <= 65);
                  const lastDigit = toothNum % 10;
                  const isAnterior = [1, 2, 3].includes(lastDigit) || [61, 62, 63, 71, 72, 73].includes(toothNum);

                  switch (proc.sector) {
                    case 'left': cara = 'M'; break;
                    case 'right': cara = 'D'; break;
                    case 'top': case 'topUpper': case 'topLower': cara = 'V'; break;
                    case 'bottom': cara = isUpper ? 'P' : 'L'; break;
                    case 'centerMesial':
                    case 'centerDistal':
                    case 'center':
                      cara = isAnterior ? 'I' : 'O';
                      break;
                  }
                }
              }

              rows.push(
                <tr key={`proc-${i}`}>
                  <td className="border border-black px-2 py-1 text-center align-middle h-[20px]">{day}</td>
                  <td className="border border-black px-2 py-1 text-center align-middle h-[20px] font-bold">{toothNum || ''}</td>
                  <td className="border border-black px-2 py-1 text-center align-middle h-[20px]">{cara}</td>
                  <td className="border border-black px-2 py-1 text-center align-middle h-[20px] font-bold text-[11px]">
                    {proc.code || proc.procedure_code || proc.procedure || ''}
                  </td>
                  <td className="border border-black px-2 py-1 text-center align-middle h-[20px]"></td>
                </tr>
              );
            } else {
              rows.push(
                <tr key={`empty-${i}`}>
                  <td className="border border-black px-2 py-1 text-center align-middle h-[20px]"></td>
                  <td className="border border-black px-2 py-1 text-center align-middle h-[20px]"></td>
                  <td className="border border-black px-2 py-1 text-center align-middle h-[20px]"></td>
                  <td className="border border-black px-2 py-1 text-center align-middle h-[20px]"></td>
                  <td className="border border-black px-2 py-1 text-center align-middle h-[20px]"></td>
                </tr>
              );
            }
          }
          return rows;
        })()}
      </tbody>
    </table>
  );

  const OdontogramSection = () => (
    <div className="mt-4 mb-0 p-0">
      <div className="flex justify-between items-start m-0 p-0">
        <div className="relative m-0 p-0" style={{ width: '500px', height: `${130 * (odontogramScale / 1.2)}px` }}>
            <div className="absolute top-0 left-0 m-0 p-0" style={{ transform: `scale(${odontogramScale})`, transformOrigin: 'top left' }}>
            <Odontogram
              initialConditions={whiteMode ? [] : odontogramConditions}
              onUpdate={() => {}}
              readOnly={true}
              showLegend={false}
              showBorder={false}
              className="m-0 p-0"
              printMode={printMode}
            />
          </div>
        </div>
        <div className="w-[140px]">
          <div className="border border-black h-[180px] text-[7px] font-sans flex flex-col bg-white">
            <div className="font-bold text-center py-1 border-b border-black bg-gray-100 uppercase text-[8px]">Referencias</div>
            <div className="flex flex-col px-2 py-2 space-y-2 flex-1 justify-start">
              <div className="flex items-start">
                <span className="leading-tight"><span className="font-bold underline">ROJO:</span> Prestaciones existentes</span>
              </div>
              <div className="flex items-start">
                <span className="leading-tight"><span className="font-bold underline">AZUL:</span> Prestaciones requeridas</span>
              </div>
              <div className="flex items-start">
                <span className="leading-tight"><span className="font-bold underline">X:</span> Diente ausente / extraer</span>
              </div>
            </div>
            <div className="border-t border-black mt-auto">
              <div className="font-bold text-center text-[7px] py-1 bg-gray-100 border-b border-black uppercase">Reservado Obra Social</div>
              <div className="h-[40px]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ObservationsSection = () => (
    <div className="grid grid-cols-4 w-full mt-0 border border-black border-collapse">
      <div className="col-span-3 border-r border-black p-2 min-h-[100px]">
        <div className="text-[11px] font-bold bg-gray-100 -m-2 mb-2 p-1 border-b border-black uppercase">Observaciones</div>
        <div className="space-y-0 text-[10px]">
          {splitTextIntoLines(observaciones, 70).map((line, index) => (
            <div key={index} className="border-b border-black border-dotted w-full h-[18px] flex items-end pb-1 pl-1">
              {line}
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-1 p-2 flex flex-col justify-end items-center bg-white min-h-[100px]">
        <div className="w-full border-t border-black border-dotted mb-1"></div>
        <span className="text-[9px] font-bold text-center uppercase leading-tight">Firma y Sello del Profesional</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white text-black p-4" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="max-w-[210mm] mx-auto">
        {/* PARTE SUPERIOR (ORIGINAL) */}
        <div className="pb-8 border-b-2 border-dashed border-gray-400 relative">
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-[10px] text-gray-400 font-bold">
            
          </div>
          <HeaderSection />
          <PatientInfoTables />
          <TreatmentsTable />
        </div>

        {/* ESPACIO ENTRE PARTES */}
        <div className="h-8"></div>

        {/* PARTE INFERIOR (DUPLICADO PARA CORTE) */}
        <div className="pt-2">
          <HeaderSection />
          <PatientInfoTables2 />
          <OdontogramSection />
          <ObservationsSection />
        </div>
      </div>
    </div>
  );
};
