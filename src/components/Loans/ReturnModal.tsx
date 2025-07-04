import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { LoanWithDetails } from '../../types';

interface ReturnModalProps {
  loan: LoanWithDetails;
  onClose: () => void;
}

const ReturnModal: React.FC<ReturnModalProps> = ({ loan, onClose }) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReturn = async () => {
    setLoading(true);
    setError('');

    try {
      const now = new Date();
      // 1. Copiar el préstamo al historial
      await setDoc(doc(db, 'loanHistory', loan.id), {
        ...loan,
        status: 'returned',
        returnDate: now,
        returnNotes: notes,
        updatedAt: now
      });

      // 2. Eliminar el préstamo de la colección loans
      await deleteDoc(doc(db, 'loans', loan.id));

      // 3. Actualizar la herramienta como disponible
      await updateDoc(doc(db, 'tools', loan.toolId), {
        isAvailable: true,
        updatedAt: now
      });

      onClose();
    } catch (error) {
      console.error('Error returning tool:', error);
      setError('Error al procesar la devolución');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Devolver Herramienta</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Loan Details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-2">Detalles del Préstamo</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Herramienta:</span>
                <span className="font-medium text-gray-900">{loan.tool.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estudiante:</span>
                <span className="font-medium text-gray-900">{loan.student.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ticket:</span>
                <span className="font-medium text-gray-900">#{loan.ticketCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className={`font-medium ${loan.status === 'overdue' ? 'text-red-600' : 'text-blue-600'}`}>
                  {loan.status === 'overdue' ? 'Vencido' : 'Activo'}
                </span>
              </div>
            </div>
          </div>

          {/* Return Notes */}
          <div>
            <label htmlFor="returnNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Notas de Devolución (Opcional)
            </label>
            <textarea
              id="returnNotes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Estado de la herramienta, observaciones, etc..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleReturn}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Confirmar Devolución</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;