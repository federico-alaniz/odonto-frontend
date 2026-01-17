'use client';

import { useState, useEffect, useMemo } from 'react';
import { LoadingSpinner } from '@/components/ui/Spinner';
import { useParams, useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { ArrowLeft, Info, User, Calendar, Stethoscope, Activity, Pill, ClipboardList, FileText, Printer } from 'lucide-react';
import medicalRecordsService, { MedicalRecord } from '@/services/medicalRecords';
import { patientsService } from '@/services/api/patients.service';
import { usersService } from '@/services/api/users.service';
import { useAuth } from '@/hooks/useAuth';
import Odontogram from '../../../components/Odontogram';
import ImageViewerModal from '../../../modals/ImageViewerModal';

/**
 * Página de detalle de registro médico (Solo lectura)
 * 
 * IMPORTANTE: Los registros médicos NO deben ser editables para mantener
 * la integridad y trazabilidad de la historia clínica del paciente.
 * 
 * Si se necesita corregir información, se debe implementar un sistema de
 * rectificaciones que mantenga el registro original y agregue una nota
 * de corrección con fecha, usuario y motivo.
 */
export default function RegistroDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const patientId = params.id as string;
  const registroId = params.registroId as string;
  
  const [registro, setRegistro] = useState<MedicalRecord | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [doctorName, setDoctorName] = useState<string>('');
  const [doctorLicense, setDoctorLicense] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Estados para el visor de imágenes
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Estado para tabs de odontogramas
  const [odontogramTab, setOdontogramTab] = useState<'actual' | 'historial'>('actual');

  const clinicId = useMemo(() => {
    return (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
  }, [currentUser?.id]);

  useEffect(() => {
    const loadData = async () => {
      if (!clinicId) {
        return;
      }

      try {
        setLoading(true);
        
        // Load patient data
        const patientResponse = await patientsService.getPatientById(patientId, clinicId);
        if (patientResponse.success) {
          setPatient(patientResponse.data);
        }
        
        // Load medical record
        const recordResponse = await medicalRecordsService.getById(registroId, clinicId);
        if (recordResponse.success && recordResponse.data) {
          setRegistro(recordResponse.data);
          
          // Load doctor information if doctorId exists, otherwise use createdBy
          const userIdToLoad = recordResponse.data.doctorId || recordResponse.data.createdBy;
          
          if (userIdToLoad) {
            try {
              if (userIdToLoad === 'system') {
                setDoctorName('N/A');
                setDoctorLicense('');
              } else if (userIdToLoad.includes('@')) {
                const doctorResponse = await usersService.authenticateByEmail(userIdToLoad, clinicId);
                if (doctorResponse.success && doctorResponse.data) {
                  const fullName = doctorResponse.data.name || 
                    `${doctorResponse.data.nombres} ${doctorResponse.data.apellidos}`.trim();
                  setDoctorName(fullName || 'N/A');
                  
                  // Intentar diferentes campos para la matrícula
                  const license = (doctorResponse.data as any).matriculaProfesional || 
                                 (doctorResponse.data as any).matricula || 
                                 (doctorResponse.data as any).license || 
                                 (doctorResponse.data as any).numeroMatricula || '';
                  setDoctorLicense(license);
                } else {
                  setDoctorName('N/A');
                  setDoctorLicense('');
                }
              } else {
                const doctorResponse = await usersService.getUserById(userIdToLoad, clinicId);
                if (doctorResponse.success && doctorResponse.data) {
                  const fullName = doctorResponse.data.name || 
                    `${doctorResponse.data.nombres} ${doctorResponse.data.apellidos}`.trim();
                  setDoctorName(fullName || 'N/A');
                  
                  // Intentar diferentes campos para la matrícula
                  const license = (doctorResponse.data as any).matriculaProfesional || 
                                 (doctorResponse.data as any).matricula || 
                                 (doctorResponse.data as any).license || 
                                 (doctorResponse.data as any).numeroMatricula || '';
                  setDoctorLicense(license);
                } else {
                  setDoctorName('N/A');
                  setDoctorLicense('');
                }
              }
            } catch (error) {
              console.error('❌ Error al cargar información del doctor:', error);
              setDoctorName('N/A');
              setDoctorLicense('');
            }
          } else {
            setDoctorName('N/A');
            setDoctorLicense('');
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (clinicId) {
      loadData();
    }
  }, [patientId, registroId, clinicId]);

  const handleBack = () => {
    router.push(`/historiales/${patientId}`);
  };

  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const handlePrintOdontogram = async () => {
    if (!registro) {
      alert('No hay registro médico disponible para imprimir.');
      return;
    }

    try {
      // Importar jsPDF dinámicamente
      const { jsPDF } = await import('jspdf');
      
      // Crear un nuevo documento PDF en formato A4
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Configuración de la página
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 0; // Sin márgenes para ocupar todo el ancho
      const contentWidth = pageWidth;
      let yPosition = 0;

      // Cargar y agregar los SVGs del odontograma
      try {
        // Cargar SVG frontal
        const frontSvgResponse = await fetch('/odontologia/fichadental_front.svg');
        const frontSvgText = await frontSvgResponse.text();
        
        // Crear un elemento temporal para renderizar el SVG
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = frontSvgText;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);
        
        const svgElement = tempDiv.querySelector('svg');
        if (svgElement) {
          // Clonar el SVG para modificarlo
          const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
          
          // Crear grupo de texto para la información del paciente
          const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          textGroup.setAttribute('id', 'patient-info');
          
          // Formatear dirección
          const direccion = patient?.direccion 
            ? (`${patient.direccion.calle || ''} ${patient.direccion.numero || ''} `).trim()
            : 'N/A';
          const ciudad = patient?.direccion?.ciudad 
    ? patient.direccion.ciudad
        .replace(/_/g, ' ')                    // Reemplazar guiones bajos con espacios
        .replace(/\b\w/g, (l: string) => l.toUpperCase()) // Capitalizar primera letra de cada palabra
        .trim()
    : '';
          
          // Formatear fecha de nacimiento separada en día, mes y año
          let dia = '';
          let mes = '';
          let anio = '';
          
          if (patient?.fechaNacimiento) {
            const fecha = new Date(patient.fechaNacimiento);
            dia = fecha.getDate().toString().padStart(2, '0');
            mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
            anio = fecha.getFullYear().toString();
          }
          
          // Información del paciente con coordenadas ajustadas al SVG (viewBox: 0 0 595 453)
          // Solo los valores, sin etiquetas
          const patientInfo = [
            { value: patient?.nombreCompleto || '', x: 150, y: 68 },  // Apellido y Nombre
            { value: patient?.seguroMedico?.empresa || 'Sin O.S.', x: 430, y: 68 },  // Obra Social
            { value: direccion, x: 110, y: 105 },  // Domicilio
            { value: ciudad, x: 420, y: 105 },
            { value: dia, x: 470, y: 85 },   // Día
            { value: mes, x: 495, y: 85 },   // Mes
            { value: anio, x: 520, y: 85 }   // Año
          ];
          
          // Agregar solo los valores al SVG
          patientInfo.forEach((info) => {
            const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textElement.setAttribute('x', info.x.toString());
            textElement.setAttribute('y', info.y.toString());
            textElement.setAttribute('font-family', 'Arial, sans-serif');
            textElement.setAttribute('font-size', '12');
            textElement.setAttribute('font-weight', 'bold');
            textElement.setAttribute('fill', '#150FA6');
            textElement.textContent = info.value;
            textGroup.appendChild(textElement);
          });
          
          // Insertar el grupo al final del SVG para que aparezca encima de todo
          svgClone.appendChild(textGroup);
          
          // Aplicar condiciones del odontograma si existen
          if (registro.odontogramas) {
            // Mapeo de números de diente a coordenadas
            const toothCoordinates: { [key: number]: { x: number, y: number } } = {
              18: { x: 84, y: 138 }, 17: { x: 103, y: 138 }, 16: { x: 122, y: 138 }, 15: { x: 141, y: 138 },
              14: { x: 160, y: 138 }, 13: { x: 179, y: 138 }, 12: { x: 198, y: 138 }, 11: { x: 217, y: 138 },
              21: { x: 251, y: 138 }, 22: { x: 270, y: 138 }, 23: { x: 289, y: 138 }, 24: { x: 308, y: 138 },
              25: { x: 327, y: 138 }, 26: { x: 346, y: 138 }, 27: { x: 365, y: 138 }, 28: { x: 384, y: 138 },
              48: { x: 83, y: 175 }, 47: { x: 102, y: 175 }, 46: { x: 121, y: 175 }, 45: { x: 140, y: 175 },
              44: { x: 178, y: 175 }, 43: { x: 197, y: 175 }, 42: { x: 216, y: 175 }, 41: { x: 235, y: 175 },
              31: { x: 251, y: 175 }, 32: { x: 270, y: 175 }, 33: { x: 289, y: 175 }, 34: { x: 308, y: 175 },
              35: { x: 327, y: 175 }, 36: { x: 346, y: 175 }, 37: { x: 365, y: 175 }, 38: { x: 384, y: 175 },
              55: { x: 141, y: 230 }, 54: { x: 160, y: 230 }, 53: { x: 179, y: 230 }, 52: { x: 198, y: 230 }, 51: { x: 217, y: 230 },
              61: { x: 251, y: 230 }, 62: { x: 270, y: 230 }, 63: { x: 289, y: 230 }, 64: { x: 308, y: 230 }, 65: { x: 327, y: 230 },
              85: { x: 140, y: 267 }, 84: { x: 159, y: 267 }, 83: { x: 178, y: 267 }, 82: { x: 197, y: 267 }, 81: { x: 216, y: 267 },
              71: { x: 251, y: 267 }, 72: { x: 270, y: 267 }, 73: { x: 289, y: 267 }, 74: { x: 308, y: 267 }, 75: { x: 327, y: 267 }
            };

            // Función para procesar condiciones con un color específico
            const processConditions = (conditions: any[], color: string, label: string) => {
              conditions.forEach((condition: any) => {
                const toothNumber = condition.number;
                const status = condition.status;
                const sectors = condition.sectors || [];
                const hasCrown = condition.hasCrown || false;
                const hasProsthesis = condition.hasProsthesis || false;
                const coords = toothCoordinates[toothNumber];
                
                if (!coords) return;
                
                const groups = svgClone.querySelectorAll('g[clip-path]');
                let toothGroup: Element | null = null;
                
                groups.forEach((group) => {
                  const rectWithTransform = group.querySelector(`rect[transform*="translate(${coords.x} ${coords.y})"]`);
                  if (rectWithTransform) toothGroup = group;
                });
                
                if (!toothGroup) return;
                const group = toothGroup as Element;
                
                // Extracciones
                if (status === 'extraction') {
                  const baseRect = group.querySelector('rect[transform]') as SVGRectElement;
                  if (baseRect) {
                    const transform = baseRect.getAttribute('transform');
                    const match = transform?.match(/translate\((\d+)\s+(\d+)\)/);
                    if (match) {
                      const baseX = parseInt(match[1]);
                      const baseY = parseInt(match[2]);
                      const width = 13;
                      const height = 13;
                      
                      const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                      line1.setAttribute('x1', baseX.toString());
                      line1.setAttribute('y1', baseY.toString());
                      line1.setAttribute('x2', (baseX + width).toString());
                      line1.setAttribute('y2', (baseY + height).toString());
                      line1.setAttribute('stroke', color);
                      line1.setAttribute('stroke-width', '2');
                      line1.setAttribute('opacity', '0.85');
                      group.appendChild(line1);
                      
                      const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                      line2.setAttribute('x1', (baseX + width).toString());
                      line2.setAttribute('y1', baseY.toString());
                      line2.setAttribute('x2', baseX.toString());
                      line2.setAttribute('y2', (baseY + height).toString());
                      line2.setAttribute('stroke', color);
                      line2.setAttribute('stroke-width', '2');
                      line2.setAttribute('opacity', '0.85');
                      group.appendChild(line2);
                    }
                  }
                } else if (status !== 'healthy' && status !== 'missing') {
                  const allRects = group.querySelectorAll('rect');
                  if (allRects.length > 2) {
                    (allRects[allRects.length - 1] as Element).setAttribute('fill', color);
                    (allRects[allRects.length - 1] as Element).setAttribute('opacity', '0.85');
                  } else if (allRects.length === 2) {
                    (allRects[1] as Element).setAttribute('fill', color);
                    (allRects[1] as Element).setAttribute('opacity', '0.85');
                  }
                }
                
                // Sectores
                if (sectors.length > 0) {
                  const baseRect = group.querySelector('rect[transform]') as SVGRectElement;
                  if (baseRect) {
                    const transform = baseRect.getAttribute('transform');
                    const match = transform?.match(/translate\((\d+)\s+(\d+)\)/);
                    if (match) {
                      const baseX = parseInt(match[1]);
                      const baseY = parseInt(match[2]);
                      const width = 13;
                      const height = 13;
                      
                      sectors.forEach((sectorData: any) => {
                        const sector = sectorData.sector;
                        let points = '';
                        
                        if (sector === 'top') {
                          points = `${baseX + 3.5},${baseY + 3.5} ${baseX + 9.5},${baseY + 3.5} ${baseX + width},${baseY} ${baseX},${baseY}`;
                        } else if (sector === 'bottom') {
                          points = `${baseX + 3.5},${baseY + 9.5} ${baseX + 9.5},${baseY + 9.5} ${baseX + width},${baseY + height} ${baseX},${baseY + height}`;
                        } else if (sector === 'left') {
                          points = `${baseX},${baseY} ${baseX + 3.5},${baseY + 3.5} ${baseX + 3.5},${baseY + 9.5} ${baseX},${baseY + height}`;
                        } else if (sector === 'right') {
                          points = `${baseX + width},${baseY} ${baseX + 9.5},${baseY + 3.5} ${baseX + 9.5},${baseY + 9.5} ${baseX + width},${baseY + height}`;
                        } else if (sector === 'center') {
                          const centerRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                          centerRect.setAttribute('x', (baseX + 3.5).toString());
                          centerRect.setAttribute('y', (baseY + 3.5).toString());
                          centerRect.setAttribute('width', '6');
                          centerRect.setAttribute('height', '6');
                          centerRect.setAttribute('fill', color);
                          centerRect.setAttribute('opacity', '0.85');
                          group.appendChild(centerRect);
                          return;
                        }
                        
                        if (points) {
                          const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                          polygon.setAttribute('points', points);
                          polygon.setAttribute('fill', color);
                          polygon.setAttribute('opacity', '0.85');
                          group.appendChild(polygon);
                        }
                      });
                    }
                  }
                }
                
                // Coronas
                if (hasCrown) {
                  const baseRect = group.querySelector('rect[transform]') as SVGRectElement;
                  if (baseRect) {
                    const transform = baseRect.getAttribute('transform');
                    const match = transform?.match(/translate\((\d+)\s+(\d+)\)/);
                    if (match) {
                      const baseX = parseInt(match[1]);
                      const baseY = parseInt(match[2]);
                      const centerX = baseX + 6.5;
                      const centerY = baseY + 6.5;
                      
                      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                      circle.setAttribute('cx', centerX.toString());
                      circle.setAttribute('cy', centerY.toString());
                      circle.setAttribute('r', '5.5');
                      circle.setAttribute('fill', 'none');
                      circle.setAttribute('stroke', color);
                      circle.setAttribute('stroke-width', '2');
                      circle.setAttribute('opacity', '0.85');
                      svgClone.appendChild(circle);
                    }
                  }
                }
                
                // Prótesis
                if (hasProsthesis) {
                  const baseRect = group.querySelector('rect[transform]') as SVGRectElement;
                  if (baseRect) {
                    const transform = baseRect.getAttribute('transform');
                    const match = transform?.match(/translate\((\d+)\s+(\d+)\)/);
                    if (match) {
                      const baseX = parseInt(match[1]);
                      const baseY = parseInt(match[2]);
                      const extension = 3;
                      
                      const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                      line1.setAttribute('x1', (baseX - extension).toString());
                      line1.setAttribute('y1', (baseY + 4).toString());
                      line1.setAttribute('x2', (baseX + 13 + extension).toString());
                      line1.setAttribute('y2', (baseY + 4).toString());
                      line1.setAttribute('stroke', color);
                      line1.setAttribute('stroke-width', '2');
                      line1.setAttribute('opacity', '0.85');
                      group.appendChild(line1);
                      
                      const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                      line2.setAttribute('x1', (baseX - extension).toString());
                      line2.setAttribute('y1', (baseY + 9).toString());
                      line2.setAttribute('x2', (baseX + 13 + extension).toString());
                      line2.setAttribute('y2', (baseY + 9).toString());
                      line2.setAttribute('stroke', color);
                      line2.setAttribute('stroke-width', '2');
                      line2.setAttribute('opacity', '0.85');
                      group.appendChild(line2);
                    }
                  }
                }
              });
            };

            // Procesar histórico en rojo
            if (registro.odontogramas.historico && registro.odontogramas.historico.length > 0) {
              processConditions(registro.odontogramas.historico, '#ef4444', 'HISTÓRICO');
            }

            // Procesar actual en azul
            if (registro.odontogramas.actual && registro.odontogramas.actual.length > 0) {
              processConditions(registro.odontogramas.actual, '#2563eb', 'ACTUAL');
            }
          }
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const svgData = new XMLSerializer().serializeToString(svgClone);
          const img = new window.Image();
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              // Aumentar la resolución 3x para mejor calidad
              const scale = 3;
              const svgWidth = svgClone.viewBox.baseVal.width || 595;
              const svgHeight = svgClone.viewBox.baseVal.height || 453;
              canvas.width = svgWidth * scale;
              canvas.height = svgHeight * scale;
              ctx?.scale(scale, scale);
              ctx?.drawImage(img, 0, 0);
              
              // Agregar la imagen al PDF
              const imgData = canvas.toDataURL('image/png');
              const imgWidth = contentWidth;
              const imgHeight = (svgHeight * imgWidth) / svgWidth;
              
              pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
              resolve(null);
            };
            img.onerror = reject;
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
          });
        }
        
        document.body.removeChild(tempDiv);
        
        // Agregar nueva página para el SVG posterior
        pdf.addPage();
        yPosition = margin + 10;
        
        
        // Cargar SVG posterior
        const backSvgResponse = await fetch('/odontologia/fichadental_back.svg');
        const backSvgText = await backSvgResponse.text();
        
        const tempDiv2 = document.createElement('div');
        tempDiv2.innerHTML = backSvgText;
        tempDiv2.style.position = 'absolute';
        tempDiv2.style.left = '-9999px';
        document.body.appendChild(tempDiv2);
        
        const svgElement2 = tempDiv2.querySelector('svg');
        if (svgElement2) {
          // Clonar el SVG para modificarlo
          const svgClone2 = svgElement2.cloneNode(true) as SVGSVGElement;
          
          // Crear grupo de texto para información de la consulta
          const textGroup2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          textGroup2.setAttribute('id', 'consulta-info');
          
          // Obtener mes y año de la fecha de la consulta
          let mesConsulta = '';
          let anioConsulta = '';
          
          if (registro?.fecha) {
            const fechaConsulta = new Date(registro.fecha);
            mesConsulta = (fechaConsulta.getMonth() + 1).toString().padStart(2, '0');
            anioConsulta = fechaConsulta.getFullYear().toString().slice(-2); // Últimos 2 dígitos
          } else {
            mesConsulta = '01';
            anioConsulta = '24';
          }
          
          // Obtener sexo del paciente (F, M, o X si no especifica)
          let sexo = 'X';
          if (patient?.genero) {
            if (patient.genero === 'femenino') {
              sexo = 'F';
            } else if (patient.genero === 'masculino') {
              sexo = 'M';
            } else {
              sexo = 'X'; // Para 'otro' o cualquier otro valor
            }
          }
          
          // Calcular edad del paciente
          let edad = '';
          if (patient?.fechaNacimiento) {
            const hoy = new Date();
            const nacimiento = new Date(patient.fechaNacimiento);
            let edadCalculada = hoy.getFullYear() - nacimiento.getFullYear();
            const mesActual = hoy.getMonth();
            const mesNacimiento = nacimiento.getMonth();
            
            if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
              edadCalculada--;
            }
            
            edad = edadCalculada.toString().padStart(2, '0');
          } else {
            edad = '00';
          }

          //Numero de obra social del paciente
          let obraSocial = '';
          let obraSocialId = '';
          
          // Debug: Ver todos los datos del paciente
          
          // Extraer obra social y número
          if (patient?.seguroMedico) {
            
            const empresa = patient.seguroMedico.empresa || '';
            const numeroPoliza = patient.seguroMedico.numeroPoliza || '';
            
            // Asignar siempre el número por separado
            obraSocialId = numeroPoliza;
            
            if (empresa && obraSocialId) {
              obraSocial = empresa;
            } else {
              obraSocial = 'Sin O.S.';
              obraSocialId = '';
            }
            
          } else {
            obraSocial = 'Sin O.S.';
            obraSocialId = '';
          }
          

          
          // Asegurarse de que doctorName y doctorLicense estén inicializadas
          const currentDoctorName = doctorName || '';
          const currentDoctorLicense = doctorLicense || '';

          // Información a agregar al SVG con coordenadas
          const consultaInfo = [
            { value: sexo, x: 211, y: 150 },                      // Sexo
            { value: edad.charAt(0), x: 270, y: 150 },            // Edad - primer dígito
            { value: edad.charAt(1), x: 290, y: 150 },            // Edad - segundo dígito
            { value: mesConsulta.charAt(0), x: 270, y: 102 },    // Mes - primer dígito
            { value: mesConsulta.charAt(1), x: 290, y: 102 },    // Mes - segundo dígito
            { value: anioConsulta.charAt(0), x: 365, y: 102 },   // Año - primer dígito
            { value: anioConsulta.charAt(1), x: 385, y: 102 },    // Año - segundo dígito
            { value: currentDoctorName, x: 160, y: 180 },                // Doctor - Nombre
            { value: obraSocial, x:405, y:50},
            { value: obraSocialId.charAt(obraSocialId.length - 1), x:530, y:150},
            { value: obraSocialId.charAt(obraSocialId.length - 2), x:513, y:150},
            { value: obraSocialId.charAt(obraSocialId.length - 3), x:496, y:150},
            { value: obraSocialId.charAt(obraSocialId.length - 4), x:479, y:150},
            { value: obraSocialId.charAt(obraSocialId.length - 5), x:462, y:150},
            { value: obraSocialId.charAt(obraSocialId.length - 6), x:445, y:150},
            { value: obraSocialId.charAt(obraSocialId.length - 7), x:428, y:150},
            { value: obraSocialId.charAt(obraSocialId.length - 8), x:411, y:150},
            { value: obraSocialId.charAt(obraSocialId.length - 9), x:394, y:150},
            { value: obraSocialId.charAt(obraSocialId.length - 10), x:377, y:150},
            { value: obraSocialId.charAt(obraSocialId.length - 11), x:360, y:150},
            { value: obraSocialId.charAt(obraSocialId.length - 12), x:343, y:150},
            { value: currentDoctorLicense.charAt(currentDoctorLicense.length - 1), x: 530, y: 180 },          
            { value: currentDoctorLicense.charAt(currentDoctorLicense.length - 2), x: 513, y: 180 },              
            { value: currentDoctorLicense.charAt(currentDoctorLicense.length - 3), x: 496, y: 180 },              
            { value: currentDoctorLicense.charAt(currentDoctorLicense.length - 4), x: 479, y: 180 },              
            { value: currentDoctorLicense.charAt(currentDoctorLicense.length - 5), x: 462, y: 180 },              
            { value: currentDoctorLicense.charAt(currentDoctorLicense.length - 6), x: 445, y: 180 }              
          ];
          
          // Agregar los valores al SVG
          consultaInfo.forEach((info) => {
            const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textElement.setAttribute('x', info.x.toString());
            textElement.setAttribute('y', info.y.toString());
            textElement.setAttribute('font-family', 'Arial, sans-serif');
            textElement.setAttribute('font-size', '12');
            textElement.setAttribute('font-weight', 'bold');
            textElement.setAttribute('fill', '#150FA6');
            textElement.setAttribute('text-anchor', 'middle');
            textElement.setAttribute('dominant-baseline', 'middle');
            textElement.textContent = info.value;
            textGroup2.appendChild(textElement);
          });
          
          // Insertar el grupo al final del SVG
          svgClone2.appendChild(textGroup2);
          
          const canvas2 = document.createElement('canvas');
          const ctx2 = canvas2.getContext('2d');
          const svgData2 = new XMLSerializer().serializeToString(svgClone2);
          const img2 = new window.Image();
          
          await new Promise((resolve, reject) => {
            img2.onload = () => {
              // Aumentar la resolución 3x para mejor calidad
              const scale = 3;
              const svgWidth = svgElement2.viewBox.baseVal.width || 800;
              const svgHeight = svgElement2.viewBox.baseVal.height || 600;
              canvas2.width = svgWidth * scale;
              canvas2.height = svgHeight * scale;
              ctx2?.scale(scale, scale);
              ctx2?.drawImage(img2, 0, 0);
              
              const imgData2 = canvas2.toDataURL('image/png');
              const imgWidth2 = contentWidth;
              const imgHeight2 = (svgHeight * imgWidth2) / svgWidth;
              
              pdf.addImage(imgData2, 'PNG', margin, yPosition, imgWidth2, imgHeight2);
              resolve(null);
            };
            img2.onerror = reject;
            img2.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData2)));
          });
        }
        
        document.body.removeChild(tempDiv2);
        
      } catch (error) {
        console.error('Error al cargar los SVGs:', error);
        pdf.setFontSize(12);
        pdf.text('Error al cargar las imágenes del odontograma', margin, yPosition);
      }
      
      // Agregar información adicional si existe
      if (registro.diagnostico || registro.tratamiento) {
        pdf.addPage();
        yPosition = margin + 10;
        
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Información Adicional', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;
        
        if (registro.diagnostico) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Diagnóstico:', margin, yPosition);
          yPosition += 7;
          
          pdf.setFont('helvetica', 'normal');
          const diagnosticoLines = pdf.splitTextToSize(registro.diagnostico, contentWidth);
          pdf.text(diagnosticoLines, margin, yPosition);
          yPosition += (diagnosticoLines.length * 7) + 10;
        }
        
        if (registro.tratamiento) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Tratamiento:', margin, yPosition);
          yPosition += 7;
          
          pdf.setFont('helvetica', 'normal');
          const tratamientoLines = pdf.splitTextToSize(registro.tratamiento, contentWidth);
          pdf.text(tratamientoLines, margin, yPosition);
        }
      }
      
      // Generar el nombre del archivo
      const fileName = `Odontograma_${patient?.nombreCompleto?.replace(/\s+/g, '_') || 'Paciente'}_${formatDate(registro.fecha).replace(/\s+/g, '_')}.pdf`;
      
      // Descargar el PDF
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Error al generar el PDF del odontograma. Por favor, intenta nuevamente.');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getConsultaTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'general': 'Consulta General',
      'odontologia': 'Odontología',
      'pediatria': 'Pediatría',
      'cardiologia': 'Cardiología',
      'traumatologia': 'Traumatología',
      'ginecologia': 'Ginecología',
      'dermatologia': 'Dermatología',
      'neurologia': 'Neurología',
      'psiquiatria': 'Psiquiatría',
      'oftalmologia': 'Oftalmología'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <LoadingSpinner message="Cargando registro..." />
      </div>
    );
  }

  if (!registro) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Registro médico no encontrado</h2>
          <p className="text-gray-600 mb-4">El registro médico que buscas no existe o ha sido eliminado.</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Volver a Historia Clínica
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap">
              <button
                onClick={handleBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Registro Médico</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  {patient?.nombreCompleto || 'Paciente'} • {formatDate(registro.fecha)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={handlePrintOdontogram}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span className="text-sm">Imprimir Odontograma</span>
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <Info className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-800 font-medium">Registro de solo lectura</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb visual */}
        <div className="px-6 pb-4">
          <div className="flex items-center text-sm text-gray-500 space-x-2">
            <span>Gestión</span>
            <span>•</span>
            <span className="text-blue-600 font-medium">Historiales Clínicos</span>
            <span>•</span>
            <span>{patient?.nombreCompleto || 'Paciente'}</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
          
        {/* Información General */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Información de la Consulta</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Datos generales del registro médico</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Fecha</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-900">{formatDate(registro.fecha)}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Tipo de Consulta</label>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-900">{getConsultaTypeLabel(registro.tipoConsulta)}</p>
                </div>
              </div>
              
              {doctorName && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">Odontólogo</label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{doctorName}</p>
                      {doctorLicense && (
                        <p className="text-sm text-gray-600">Matrícula: {doctorLicense}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Creado</label>
                <p className="text-sm text-gray-600">{formatDateTime(registro.createdAt)}</p>
              </div>
            </div>
            
            {/* Motivo de Consulta */}
            {registro.motivoConsulta && (
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Motivo de Consulta</label>
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">{registro.motivoConsulta}</p>
              </div>
            )}
            
            {/* Observaciones */}
            {registro.observaciones && (
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">{registro.observaciones}</p>
              </div>
            )}
          </div>
        </div>

        {/* Anamnesis */}
        {registro.anamnesis && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Anamnesis</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Historia clínica del paciente</p>
            </div>
            <div className="p-6">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.anamnesis}</p>
            </div>
          </div>
        )}

        {/* Diagnóstico y Tratamiento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {registro.diagnostico && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Diagnóstico</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">Diagnóstico médico establecido</p>
              </div>
              <div className="p-6">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.diagnostico}</p>
              </div>
            </div>
          )}
          
          {registro.tratamiento && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Tratamiento</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">Plan de tratamiento recomendado</p>
              </div>
              <div className="p-6">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.tratamiento}</p>
              </div>
            </div>
          )}
        </div>

        {/* Signos Vitales */}
        {registro.signosVitales && registro.signosVitales.presionArterial && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-600" />
                <h3 className="text-xl font-semibold text-gray-900">Signos Vitales</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Mediciones de signos vitales</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {registro.signosVitales.presionArterial && (
                  <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-2xl font-bold text-red-600">{registro.signosVitales.presionArterial}</div>
                    <div className="text-sm text-gray-600">Presión Arterial</div>
                    <div className="text-xs text-gray-500">mmHg</div>
                  </div>
                )}
                {registro.signosVitales.frecuenciaCardiaca && (
                  <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-2xl font-bold text-blue-600">{registro.signosVitales.frecuenciaCardiaca}</div>
                    <div className="text-sm text-gray-600">Frecuencia Cardíaca</div>
                    <div className="text-xs text-gray-500">bpm</div>
                  </div>
                )}
                {registro.signosVitales.temperatura && (
                  <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-2xl font-bold text-green-600">{registro.signosVitales.temperatura}</div>
                    <div className="text-sm text-gray-600">Temperatura</div>
                    <div className="text-xs text-gray-500">°C</div>
                  </div>
                )}
                {registro.signosVitales.peso && (
                  <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-2xl font-bold text-purple-600">{registro.signosVitales.peso}</div>
                    <div className="text-sm text-gray-600">Peso</div>
                    <div className="text-xs text-gray-500">kg</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Examen Físico */}
        {registro.examenFisico && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900">Examen Físico</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Hallazgos del examen físico</p>
            </div>
            <div className="p-6">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.examenFisico}</p>
            </div>
          </div>
        )}

        {/* Prescripciones */}
        {registro.prescripciones && registro.prescripciones.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Prescripciones</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Medicamentos prescritos y dosificación</p>
            </div>
            <div className="p-6">
              <div className="grid gap-4">
                {registro.prescripciones.map((prescripcion, index: number) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{prescripcion.medicamento}</h4>
                      <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded border">
                        {prescripcion.dosis}
                      </span>
                    </div>
                    {prescripcion.indicaciones && (
                      <p className="text-gray-700 text-sm mb-2">{prescripcion.indicaciones}</p>
                    )}
                    <p className="text-gray-600 text-xs">
                      <strong>Frecuencia:</strong> {prescripcion.frecuencia} | 
                      <strong> Duración:</strong> {prescripcion.duracion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Odontogramas con Tabs - Solo para especialidad odontología */}
        {registro.tipoConsulta === 'odontologia' && registro.odontogramas && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg shadow-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Odontogramas</h3>
                  <p className="text-sm text-gray-600 mt-1">Estado dental del paciente</p>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setOdontogramTab('actual')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
                  odontogramTab === 'actual'
                    ? 'text-green-700 border-b-3 border-green-600 bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Práctica Actual
              </button>
              <button
                onClick={() => setOdontogramTab('historial')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
                  odontogramTab === 'historial'
                    ? 'text-green-700 border-b-3 border-green-600 bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Historial
              </button>
            </div>

            {/* Tab Content */}
            <div className="px-6 py-6">
              {odontogramTab === 'actual' && (
                <div className="w-full">
                  <div className="mb-4">
                    <h4 className="text-base font-semibold text-gray-900 mb-1">Consulta Actual</h4>
                    <p className="text-sm text-gray-600">
                      Tratamientos realizados en esta consulta
                    </p>
                  </div>
                  <div className="w-full">
                    <Odontogram
                      initialConditions={registro.odontogramas.actual || []}
                      onUpdate={() => {}} // Solo lectura
                      readOnly={true}
                      showLegend={false}
                      interventionColor="blue"
                    />
                  </div>
                </div>
              )}

              {odontogramTab === 'historial' && (
                <div className="w-full">
                  <div className="mb-4">
                    <h4 className="text-base font-semibold text-gray-900 mb-1">Historial de Tratamientos</h4>
                    <p className="text-sm text-gray-600">
                      Registro acumulado de tratamientos previos
                    </p>
                  </div>
                  <div className="w-full">
                    <Odontogram
                      initialConditions={registro.odontogramas.historico || []}
                      onUpdate={() => {}} // Solo lectura
                      readOnly={true}
                      showLegend={false}
                      interventionColor="red"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Imágenes */}
        {registro.imagenes && registro.imagenes.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Imágenes</h3>
                </div>
                <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {registro.imagenes.length} {registro.imagenes.length === 1 ? 'imagen' : 'imágenes'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Imágenes adjuntas al registro</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {registro.imagenes.map((image, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-gray-50">
                    <div className="p-4">
                      <p className="text-sm text-gray-700 leading-relaxed">{image.nombre || `Imagen ${index + 1}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Image Viewer Modal */}
        {registro.imagenes && registro.imagenes.length > 0 && (
          <ImageViewerModal
            images={registro.imagenes.map((img, idx) => ({
              id: `img-${idx}`,
              name: img.nombre,
              description: '',
              type: img.tipo === 'imagen' ? 'otro' : 'otro',
              url: img.url,
              uploadDate: img.fecha
            }))}
            initialIndex={selectedImageIndex}
            isOpen={imageViewerOpen}
            onClose={() => setImageViewerOpen(false)}
          />
        )}
      </div>
    </div>
  );
}