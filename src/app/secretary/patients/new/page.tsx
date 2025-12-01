'use client';

import { UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import SecretaryNewPatientForm from './SecretaryNewPatientForm';

export default function SecretaryNewPatientPage() {
  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/secretary/patients"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                <UserPlus className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nuevo Paciente</h1>
                <p className="text-gray-600 mt-1">
                  Registro completo de un nuevo paciente en el sistema
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb visual */}
        <div className="px-6 pb-4">
          <div className="flex items-center text-sm text-gray-700 space-x-2">
            <span>Secretaría</span>
            <span>•</span>
            <Link href="/secretary/patients" className="text-purple-600 hover:text-purple-700">
              Pacientes
            </Link>
            <span>•</span>
            <span className="text-gray-700 font-medium">Nuevo Registro</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <SecretaryNewPatientForm />
      </div>
    </div>
  );
}