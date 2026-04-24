'use client';

import { useState } from 'react';
import { HelpCircle, BookOpen, MessageCircle, Phone, Mail, Search, Users, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AyudaPage() {
  const { currentUser } = useAuth();
  const userRole = (currentUser as any)?.role || 'admin';
  const [searchTerm, setSearchTerm] = useState('');

  // FAQs específicas para cada rol
  const faqByRole = {
    admin: [
      {
        question: '¿Cómo gestiono los recursos clínicos?',
        answer: 'En Administración → Ajustes → Recursos Clínicos puedes administrar especialidades, consultorios y quirófanos.'
      },
      {
        question: '¿Cómo configuro los permisos de usuarios?',
        answer: 'En Administración → Ajustes → Permisos puedes gestionar los roles y permisos de acceso al sistema.'
      },
      {
        question: '¿Cómo configuro la integración de email?',
        answer: 'En Administración → Ajustes → Integraciones puedes configurar el servidor SMTP para envío de correos.'
      },
      {
        question: '¿Cómo creo un nuevo turno?',
        answer: 'Ve a la sección de Secretaría → Turnos y haz clic en "Nuevo Turno". Selecciona el paciente, el doctor, fecha y hora disponibles.'
      },
      {
        question: '¿Cómo busco un paciente?',
        answer: 'En la sección de Secretaría → Pacientes, usa el buscador por nombre o apellido para encontrar al paciente específico.'
      },
      {
        question: '¿Cómo veo el historial médico de un paciente?',
        answer: 'En la sección de Historiales, busca el paciente y podrás ver su historial médico completo con odontogramas.'
      },
      {
        question: '¿Cómo configuro mi perfil de usuario?',
        answer: 'Ve a la sección de Configuración para ajustar tus preferencias de notificaciones y seguridad.'
      },
      {
        question: '¿Cómo gestiono el personal médico?',
        answer: 'En Secretaría → Personal Médico puedes ver y gestionar todos los doctores y su disponibilidad.'
      }
    ],
    doctor: [
      {
        question: '¿Cómo veo mi agenda de hoy?',
        answer: 'En la sección de Calendario puedes ver todos tus turnos del día y su estado.'
      },
      {
        question: '¿Cómo accedo al historial de un paciente?',
        answer: 'En la sección de Historiales busca al paciente por nombre o documento para ver su historial completo.'
      },
      {
        question: '¿Cómo registro un odontograma?',
        answer: 'En el historial del paciente, haz clic en "Nuevo Odontograma" para registrar el estado dental.'
      },
      {
        question: '¿Cómo configuro mis horarios de atención?',
        answer: 'Ve a Configuración para ajustar tus horarios de disponibilidad y preferencias.'
      },
      {
        question: '¿Cómo veo mis pacientes asignados?',
        answer: 'En la sección de Pacientes puedes ver todos tus pacientes y su historial.'
      }
    ],
    secretary: [
      {
        question: '¿Cómo creo un nuevo turno?',
        answer: 'Ve a Secretaría → Turnos y haz clic en "Nuevo Turno". Selecciona el paciente, doctor, fecha y hora.'
      },
      {
        question: '¿Cómo registro un nuevo paciente?',
        answer: 'En Secretaría → Pacientes haz clic en "Nuevo Paciente" y completa todos los datos requeridos.'
      },
      {
        question: '¿Cómo confirmo un turno?',
        answer: 'En la lista de turnos pendientes, haz clic en "Confirmar" para validar la asistencia del paciente.'
      },
      {
        question: '¿Cómo busco un paciente?',
        answer: 'Usa el buscador en Secretaría → Pacientes para encontrar por nombre, apellido o documento.'
      },
      {
        question: '¿Cómo gestiono la recepción?',
        answer: 'En Secretaría → Recepción puedes ver los pacientes en espera y gestionar el flujo de consultas.'
      },
      {
        question: '¿Cómo veo la disponibilidad de los doctores?',
        answer: 'En Secretaría → Personal Médico puedes ver los horarios y disponibilidad de cada doctor.'
      }
    ]
  };

  const faqItems = faqByRole[userRole as keyof typeof faqByRole] || faqByRole.admin;

  // Filtrar preguntas según el término de búsqueda
  const filteredFaqItems = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <HelpCircle className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Centro de Ayuda</h1>
            <p className="text-sm text-gray-600 mt-1">
              Encuentra respuestas y obtén soporte
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        
        {/* FAQ */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                Preguntas Frecuentes
              </h2>
              
              {/* Campo de búsqueda */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar preguntas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredFaqItems.length > 0 ? (
              filteredFaqItems.map((item, index) => (
                <div key={index} className="p-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {item.question}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item.answer}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No se encontraron preguntas</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm ? `No hay resultados para "${searchTerm}"` : 'Intenta con otros términos de búsqueda'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Flujo de Recepción */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Flujo de Recepción
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Conoce el proceso completo de atención al paciente en recepción
            </p>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {/* Paso 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">Llegada del Paciente</h3>
                  <p className="text-sm text-gray-600">
                    El paciente llega a la clínica y se presenta en recepción. La secretaria verifica si tiene turno asignado 
                    o si es un paciente espontáneo.
                  </p>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">Verificación de Turno</h3>
                  <p className="text-sm text-gray-600">
                    Si el paciente tiene turno, la secretaria lo confirma en el sistema. Si no tiene turno, 
                    se verifica la disponibilidad de los doctores para asignar una consulta.
                  </p>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">Registro en Espera</h3>
                  <p className="text-sm text-gray-600">
                    El paciente es registrado en la lista de espera. El sistema muestra el estado actual 
                    y el tiempo estimado de atención.
                  </p>
                </div>
              </div>

              {/* Paso 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">4</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">Pago de Consulta</h3>
                  <p className="text-sm text-gray-600">
                    Antes de ingresar a consulta, el paciente debe realizar el pago correspondiente 
                    en caja. La secretaria confirma el pago y emite el comprobante.
                  </p>
                </div>
              </div>

              {/* Paso 5 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">5</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">Llamado a Consulta</h3>
                  <p className="text-sm text-gray-600">
                    Una vez confirmado el pago, cuando el doctor está disponible, la secretaria llama al paciente 
                    y lo dirige al consultorio asignado. El estado del paciente cambia a "en consulta".
                  </p>
                </div>
              </div>

              {/* Paso 6 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">6</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">Atención Médica</h3>
                  <p className="text-sm text-gray-600">
                    El doctor realiza la consulta, registra el diagnóstico y tratamiento en el 
                    historial médico del paciente.
                  </p>
                </div>
              </div>

              {/* Paso 7 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">Finalización y Próximo Paso</h3>
                  <p className="text-sm text-gray-600">
                    La consulta finaliza, se actualiza el estado del paciente y se coordina 
                    el próximo turno si es necesario. El paciente puede retirarse con su receta 
                    e indicaciones médicas.
                  </p>
                </div>
              </div>

              {/* Nota importante */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Tiempo Promedio de Atención</h4>
                    <p className="text-sm text-blue-700">
                      El tiempo promedio de atención por paciente es de 30-45 minutos. 
                      Los pacientes espontáneos pueden tener tiempos de espera variables 
                      según la disponibilidad de los doctores.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}