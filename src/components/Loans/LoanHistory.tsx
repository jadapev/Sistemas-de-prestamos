import React, { useState, useEffect } from 'react';
import { collection, getDocs, getDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, User, Wrench, CheckCircle, FileText } from 'lucide-react';

const LoanHistory: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const q = query(collection(db, 'loanHistory'), orderBy('returnDate', 'desc'));
      const snapshot = await getDocs(q);
      const items = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          // docSnap.data() puede ser cualquier cosa, así que lo tipamos como Loan
          const data = docSnap.data() as any;
          // Si no tiene los campos, los buscamos en docSnap.data()
          const toolId = data.toolId || (data.tool && data.tool.id);
          const studentId = data.studentId || (data.student && data.student.id);
          const adminId = data.adminId || (data.admin && data.admin.id);

          // Fetch tool
          let tool = { name: 'Desconocido' };
          if (toolId) {
            const toolDoc = await getDoc(doc(db, 'tools', toolId));
            if (toolDoc.exists()) tool = { name: toolDoc.data().name || 'Sin nombre' };
          }
          // Fetch student
          let student = { name: 'Desconocido' };
          if (studentId) {
            const studentDoc = await getDoc(doc(db, 'students', studentId));
            if (studentDoc.exists()) student = { name: studentDoc.data().name || 'Sin nombre' };
          }
          // Fetch admin
          let admin = { name: 'Admin' };
          if (adminId) {
            const adminDoc = await getDoc(doc(db, 'users', adminId));
            if (adminDoc.exists()) admin = { name: adminDoc.data().name || 'Admin' };
          }
          return { id: docSnap.id, ...data, tool, student, admin };
        })
      );
      setHistory(items);
    } catch (e) {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Historial de Préstamos Devueltos</h1>
      </div>
      <div className="space-y-3 lg:space-y-4">
        {history.length === 0 && (
          <div className="text-center py-8 lg:py-12">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
              <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-gray-400" />
            </div>
            <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No hay historial de devoluciones</h3>
            <p className="text-gray-600 text-sm lg:text-base">Aún no se han devuelto préstamos.</p>
          </div>
        )}
        {history.map((item) => (
          <div key={item.id} className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-start space-x-3 lg:space-x-4 flex-1">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Wrench className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-3 mb-3">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 truncate">{item.tool.name}</h3>
                    <span className="inline-flex items-center space-x-1 px-2 lg:px-3 py-1 rounded-full text-xs font-medium self-start bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                      <span>Devuelto</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.student.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">
                          {item.loanDate && item.loanDate.toDate ? format(item.loanDate.toDate(), "d MMM yyyy", { locale: es }) : ''}
                        </p>
                        <p className="truncate">
                          Devuelto: {item.returnDate && item.returnDate.toDate ? format(item.returnDate.toDate(), "d MMM yyyy", { locale: es }) : ''}
                        </p>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">Ticket: #{item.ticketCode}</p>
                      <p className="truncate">Admin: {item.admin.name}</p>
                    </div>
                  </div>
                  {item.returnNotes && (
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
                      <span className="font-medium text-gray-700">Notas de devolución:</span> {item.returnNotes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoanHistory;
