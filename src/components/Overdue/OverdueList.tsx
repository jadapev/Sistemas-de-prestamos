import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Wrench, 
  CheckCircle,
  Clock,
  Phone,
  Mail
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { LoanWithDetails } from '../../types';
import { format, isAfter, addDays, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import ReturnModal from '../Loans/ReturnModal';

const OverdueList: React.FC = () => {
  const [overdueLoans, setOverdueLoans] = useState<LoanWithDetails[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<LoanWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanWithDetails | null>(null);

  useEffect(() => {
    fetchOverdueLoans();
  }, []);

  useEffect(() => {
    filterLoans();
  }, [overdueLoans, searchTerm, severityFilter]);

  const fetchOverdueLoans = async () => {
    try {
      const activeLoansQuery = query(
        collection(db, 'loans'),
        where('status', '==', 'active'),
        orderBy('loanDate', 'asc')
      );
      const loansSnapshot = await getDocs(activeLoansQuery);
      
      const loansWithDetails = await Promise.all(
        loansSnapshot.docs.map(async (loanDoc) => {
          const loanData = { id: loanDoc.id, ...loanDoc.data() } as any;
          
          // Check if loan is overdue (more than 15 days)
          const isOverdue = isAfter(new Date(), addDays(loanData.loanDate.toDate(), 15));
          
          if (isOverdue) {
            return {
              ...loanData,
              status: 'overdue',
              tool: { name: 'Herramienta de ejemplo', category: 'Mecánica' },
              student: { 
                name: 'Estudiante de ejemplo', 
                career: 'Ingeniería',
                email: 'estudiante@universidad.edu',
                phone: '+1 234 567 8900'
              },
              admin: { name: 'Admin' }
            } as LoanWithDetails;
          }
          return null;
        })
      );

      const overdueOnly = loansWithDetails.filter(loan => loan !== null) as LoanWithDetails[];
      setOverdueLoans(overdueOnly);
    } catch (error) {
      console.error('Error fetching overdue loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLoans = () => {
    let filtered = overdueLoans;

    if (searchTerm) {
      filtered = filtered.filter(loan =>
        loan.tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.ticketCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (severityFilter !== 'all') {
      const today = new Date();
      filtered = filtered.filter(loan => {
        const daysOverdue = differenceInDays(today, addDays(loan.loanDate.toDate(), 15));
        
        switch (severityFilter) {
          case 'mild':
            return daysOverdue <= 7;
          case 'moderate':
            return daysOverdue > 7 && daysOverdue <= 30;
          case 'severe':
            return daysOverdue > 30;
          default:
            return true;
        }
      });
    }

    setFilteredLoans(filtered);
  };

  const getSeverityLevel = (loanDate: Date) => {
    const daysOverdue = differenceInDays(new Date(), addDays(loanDate, 15));
    
    if (daysOverdue <= 7) return { level: 'mild', color: 'bg-yellow-100 text-yellow-800', label: 'Leve' };
    if (daysOverdue <= 30) return { level: 'moderate', color: 'bg-orange-100 text-orange-800', label: 'Moderado' };
    return { level: 'severe', color: 'bg-red-100 text-red-800', label: 'Severo' };
  };

  const getDaysOverdue = (loanDate: Date) => {
    return differenceInDays(new Date(), addDays(loanDate, 15));
  };

  const handleReturn = (loan: LoanWithDetails) => {
    setSelectedLoan(loan);
    setIsReturnModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsReturnModalOpen(false);
    setSelectedLoan(null);
    fetchOverdueLoans();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 lg:h-8 lg:w-8 text-red-500" />
            <span>Préstamos Vencidos</span>
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            Herramientas que han superado el plazo de devolución (15 días)
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-3 lg:px-4 py-2 rounded-xl text-sm lg:text-base">
          <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5" />
          <span className="font-medium">{overdueLoans.length} Vencidos</span>
        </div>
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
              className="w-full pl-8 lg:pl-10 pr-4 py-2 lg:py-3 bg-gray-50/80 border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm lg:text-base"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 lg:px-4 py-2 lg:py-3 bg-gray-50/80 border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm lg:text-base"
            >
              <option value="all">Todos los niveles</option>
              <option value="mild">Leve (1-7 días)</option>
              <option value="moderate">Moderado (8-30 días)</option>
              <option value="severe">Severo (+30 días)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overdue Loans List */}
      <div className="space-y-3 lg:space-y-4">
        {filteredLoans.map((loan) => {
          const severity = getSeverityLevel(loan.loanDate.toDate());
          const daysOverdue = getDaysOverdue(loan.loanDate.toDate());
          
          return (
            <div
              key={loan.id}
              className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-red-200/50 p-4 lg:p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-start space-x-3 lg:space-x-4 flex-1">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-3 mb-3">
                      <h3 className="text-base lg:text-lg font-semibold text-gray-900 truncate">{loan.tool.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center space-x-1 px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${severity.color}`}>
                          <Clock className="h-3 w-3" />
                          <span>{severity.label}</span>
                        </span>
                        <span className="text-xs lg:text-sm text-red-600 font-medium">
                          {daysOverdue} días vencido
                        </span>
                      </div>
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
                            Prestado: {format(loan.loanDate.toDate(), "d MMM yyyy", { locale: es })}
                          </p>
                          <p className="text-red-600">
                            Venció: {format(loan.dueDate.toDate(), "d MMM yyyy", { locale: es })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">Ticket: #{loan.ticketCode}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span className="text-xs truncate">{loan.student.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span className="text-xs">{loan.student.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end lg:justify-start">
                  <button
                    onClick={() => handleReturn(loan)}
                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 lg:px-4 py-2 rounded-lg lg:rounded-xl transition-all duration-200 text-sm lg:text-base"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Devolver</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLoans.length === 0 && (
        <div className="text-center py-8 lg:py-12">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
            <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-green-500" />
          </div>
          <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
            {overdueLoans.length === 0 ? '¡Excelente! No hay préstamos vencidos' : 'No se encontraron préstamos'}
          </h3>
          <p className="text-gray-600 text-sm lg:text-base">
            {overdueLoans.length === 0 
              ? 'Todos los préstamos están dentro del plazo establecido.'
              : 'Intenta cambiar los filtros de búsqueda.'
            }
          </p>
        </div>
      )}

      {/* Return Modal */}
      {isReturnModalOpen && selectedLoan && (
        <ReturnModal
          loan={selectedLoan}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default OverdueList;