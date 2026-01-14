'use client';

import { useState } from 'react';
import { X, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentData {
  sena: number;
  complemento: number;
  total: number;
  pagado: boolean;
}

interface ConfirmArrivalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: PaymentData) => void;
  patientName: string;
  appointmentTime: string;
  loading?: boolean;
}

export function ConfirmArrivalModal({
  isOpen,
  onClose,
  onConfirm,
  patientName,
  appointmentTime,
  loading = false
}: ConfirmArrivalModalProps) {
  const [sena, setSena] = useState<string>('');
  const [complemento, setComplemento] = useState<string>('');
  const [pagado, setPagado] = useState(false);

  if (!isOpen) return null;

  const parseNumber = (value: string): number => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const total = parseNumber(sena) + parseNumber(complemento);

  const handleConfirm = () => {
    const paymentData: PaymentData = {
      sena: parseNumber(sena),
      complemento: parseNumber(complemento),
      total,
      pagado
    };
    onConfirm(paymentData);
  };

  const handleClose = () => {
    if (!loading) {
      setSena('');
      setComplemento('');
      setPagado(false);
      onClose();
    }
  };

  const isValid = total > 0 || pagado;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 rounded-t-xl border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirmar Llegada</h3>
                  <p className="text-sm text-gray-600">Registrar pago de consulta</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Patient Info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Paciente</p>
                  <p className="font-semibold text-gray-900">{patientName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Hora</p>
                  <p className="font-semibold text-gray-900">{appointmentTime}</p>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={sena}
                    onChange={(e) => setSena(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    disabled={loading}
                    className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    disabled={loading}
                    className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Importe Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={pagado}
                      onChange={(e) => setPagado(e.target.checked)}
                      disabled={loading}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 border-2 rounded-md transition-all ${
                      pagado 
                        ? 'bg-green-600 border-green-600' 
                        : 'bg-white border-gray-300 group-hover:border-gray-400'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {pagado && (
                        <CheckCircle className="w-5 h-5 text-white absolute -top-0.5 -left-0.5" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      Consulta pagada
                    </span>
                    <p className="text-xs text-gray-500">
                      Marcar cuando el paciente haya completado el pago
                    </p>
                  </div>
                </label>
              </div>

              {/* Warning if not paid */}
              {!pagado && total > 0 && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Pago pendiente</p>
                    <p className="text-xs mt-1">Recuerda marcar como pagado cuando se complete el pago</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !isValid}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirmar Llegada
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
