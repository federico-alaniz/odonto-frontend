'use client';

import { HelpCircle, BookOpen, MessageCircle, Phone, Mail } from 'lucide-react';

export default function AyudaPage() {
  const faqItems = [
    {
      question: '¿Cómo puedo crear una nueva cita?',
      answer: 'Ve a la sección de Calendario y haz clic en "Nueva Cita". Completa la información del paciente y selecciona la fecha y hora disponible.'
    },
    {
      question: '¿Cómo busco el historial de un paciente?',
      answer: 'En la sección de Pacientes, usa el filtro de búsqueda por nombre o número de documento para encontrar al paciente específico.'
    },
    {
      question: '¿Puedo exportar los reportes?',
      answer: 'Sí, en la sección de Reportes encontrarás opciones para exportar los datos en formato PDF o Excel.'
    }
  ];

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
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
              Preguntas Frecuentes
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {faqItems.map((item, index) => (
              <div key={index} className="p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  {item.question}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
              Chat en Vivo
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Habla con nuestro equipo de soporte en tiempo real.
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Iniciar Chat
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-green-600" />
              Soporte por Email
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Envíanos un correo y te responderemos en 24 horas.
            </p>
            <a 
              href="mailto:soporte@clinica.com"
              className="block w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center"
            >
              soporte@clinica.com
            </a>
          </div>
        </div>

        {/* Recursos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recursos Adicionales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="#" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <BookOpen className="w-5 h-5 text-indigo-600 mr-3" />
              <span className="text-sm font-medium text-gray-700">Manual de Usuario</span>
            </a>
            <a href="#" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <MessageCircle className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-gray-700">Tutoriales en Video</span>
            </a>
            <a href="#" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Phone className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-sm font-medium text-gray-700">Contactar Soporte</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}