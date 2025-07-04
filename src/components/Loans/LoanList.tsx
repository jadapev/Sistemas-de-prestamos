import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Wrench, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { collection, getDocs, getDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { LoanWithDetails } from '../../types';
import { format, isAfter, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import LoanModal from './LoanModal';
import ReturnModal from './ReturnModal';
import LoanHistory from './LoanHistory';

// Utilidad para convertir Firestore Timestamp o Date a Date
function toDateSafe(date: any): Date | null {
  if (!date) return null;
  if (date instanceof Date) return date;
  if (typeof date.toDate === 'function') return date.toDate();
  return null;
}

const LoanList: React.FC = () => {
  const [loans, setLoans] = useState<LoanWithDetails[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<LoanWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanWithDetails | null>(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    filterLoans();
  }, [loans, searchTerm, statusFilter]);

  const fetchLoans = async () => {
    try {
      const loansQuery = query(
        collection(db, 'loans'),
        orderBy('loanDate', 'desc')
      );
      const loansSnapshot = await getDocs(loansQuery);
      
      const loansWithDetails = await Promise.all(
        loansSnapshot.docs.map(async (loanDoc) => {
          const loanData = { id: loanDoc.id, ...loanDoc.data() } as any;

          // Determine if loan is overdue
          const isOverdue = loanData.status === 'active' && 
            isAfter(new Date(), addDays(loanData.loanDate.toDate(), 15));
          if (isOverdue) {
            loanData.status = 'overdue';
          }

          // Fetch real tool
          let tool = { name: 'Desconocido', category: '' };
          if (loanData.toolId) {
            const toolDoc = await getDoc(doc(db, 'tools', loanData.toolId));
            if (toolDoc.exists()) {
              const t = toolDoc.data();
              tool = { name: t.name || 'Sin nombre', category: t.category || '' };
            }
          }

          // Fetch real student
          let student = { name: 'Desconocido', career: '' };
          if (loanData.studentId) {
            const studentDoc = await getDoc(doc(db, 'students', loanData.studentId));
            if (studentDoc.exists()) {
              const s = studentDoc.data();
              student = { name: s.name || 'Sin nombre', career: s.career || '' };
            }
          }

          // Fetch real admin (optional)
          let admin = { name: 'Admin' };
          if (loanData.adminId) {
            const adminDoc = await getDoc(doc(db, 'users', loanData.adminId));
            if (adminDoc.exists()) {
              const a = adminDoc.data();
              admin = { name: a.name || 'Admin' };
            }
          }

          return {
            ...loanData,
            tool,
            student,
            admin
          } as LoanWithDetails;
        })
      );

      setLoans(loansWithDetails);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLoans = () => {
    let filtered = loans;

    if (searchTerm) {
      filtered = filtered.filter(loan =>
        loan.tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.ticketCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(loan => loan.status === statusFilter);
    }

    setFilteredLoans(filtered);
  };

  const handleReturn = (loan: LoanWithDetails) => {
    setSelectedLoan(loan);
    setIsReturnModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsLoanModalOpen(false);
    setIsReturnModalOpen(false);
    setSelectedLoan(null);
    fetchLoans();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'returned':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-3 w-3 lg:h-4 lg:w-4" />;
      case 'returned':
        return <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4" />;
      case 'overdue':
        return <AlertTriangle className="h-3 w-3 lg:h-4 lg:w-4" />;
      default:
        return <Clock className="h-3 w-3 lg:h-4 lg:w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'returned':
        return 'Devuelto';
      case 'overdue':
        return 'Vencido';
      default:
        return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Préstamos</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Gestiona todos los préstamos de herramientas</p>
        </div>
        <button
          onClick={() => setIsLoanModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 text-sm lg:text-base"
        >
          <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
          <span>Nuevo Préstamo</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 lg:h-5 lg:w-5" />
            <input
              type="text"
              placeholder="Buscar por herramienta, estudiante o ticket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 lg:pl-10 pr-4 py-2 lg:py-3 bg-gray-50/80 border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 lg:px-4 py-2 lg:py-3 bg-gray-50/80 border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="overdue">Vencidos</option>
              <option value="returned">Devueltos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loans List */}
      <div className="space-y-3 lg:space-y-4">
        {filteredLoans.map((loan) => (
          <div
            key={loan.id}
            className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-start space-x-3 lg:space-x-4 flex-1">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Wrench className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-3 mb-3">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 truncate">{loan.tool.name}</h3>
                    <span className={`inline-flex items-center space-x-1 px-2 lg:px-3 py-1 rounded-full text-xs font-medium self-start ${getStatusColor(loan.status)}`}>
                      {getStatusIcon(loan.status)}
                      <span>{getStatusText(loan.status)}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{loan.student.name}</p>
                        <p className="truncate">{loan.student.career}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">
                          {toDateSafe(loan.loanDate) ? format(toDateSafe(loan.loanDate)!, "d MMM yyyy", { locale: es }) : ''}
                        </p>
                        <p className="truncate">
                          Vence: {toDateSafe(loan.dueDate) ? format(toDateSafe(loan.dueDate)!, "d MMM yyyy", { locale: es }) : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">Ticket: #{loan.ticketCode}</p>
                      <p className="truncate">Admin: {loan.admin.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end lg:justify-start">
                {loan.status === 'active' || loan.status === 'overdue' ? (
                  <button
                    onClick={() => handleReturn(loan)}
                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 lg:px-4 py-2 rounded-lg lg:rounded-xl transition-all duration-200 text-sm lg:text-base"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Devolver</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                    <span className="font-medium text-sm lg:text-base">Devuelto</span>
                    {toDateSafe(loan.returnDate) && (
                      <span className="text-xs lg:text-sm text-gray-500">
                        ({format(toDateSafe(loan.returnDate)!, "d MMM", { locale: es })})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLoans.length === 0 && (
        <div className="text-center py-8 lg:py-12">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
            <Search className="h-6 w-6 lg:h-8 lg:w-8 text-gray-400" />
          </div>
          <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No se encontraron préstamos</h3>
          <p className="text-gray-600 text-sm lg:text-base">Intenta cambiar los filtros o crear un nuevo préstamo.</p>
        </div>
      )}

      {/* Historial de préstamos devueltos */}
      <div className="mt-8">
        <LoanHistory />
      </div>

      {/* Modals */}
      {isLoanModalOpen && (
        <LoanModal onClose={handleCloseModals} />
      )}

      {isReturnModalOpen && selectedLoan && (
        <ReturnModal
          loan={selectedLoan}
          onClose={handleCloseModals}
        />
      )}
    </div>
  );
};

export default LoanList;