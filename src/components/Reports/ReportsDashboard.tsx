import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  Users,
  Wrench,
  ClipboardList,
  AlertTriangle,
  Filter,
  FileText
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReportData {
  totalLoans: number;
  activeLoans: number;
  returnedLoans: number;
  overdueLoans: number;
  mostUsedTools: Array<{ name: string; count: number }>;
  loansByCareer: Array<{ career: string; count: number }>;
  dailyLoans: Array<{ date: string; count: number }>;
  monthlyStats: {
    currentMonth: number;
    previousMonth: number;
    growth: number;
  };
}

const ReportsDashboard: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    totalLoans: 0,
    activeLoans: 0,
    returnedLoans: 0,
    overdueLoans: 0,
    mostUsedTools: [],
    loansByCareer: [],
    dailyLoans: [],
    monthlyStats: { currentMonth: 0, previousMonth: 0, growth: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch all loans
      const loansSnapshot = await getDocs(collection(db, 'loans'));
      const loans = loansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter by date range
      const daysBack = parseInt(dateRange);
      const startDate = subDays(new Date(), daysBack);
      const filteredLoans = loans.filter(loan => 
        loan.loanDate && loan.loanDate.toDate() >= startDate
      );

      // Calculate basic stats
      const totalLoans = filteredLoans.length;
      const activeLoans = filteredLoans.filter(loan => loan.status === 'active').length;
      const returnedLoans = filteredLoans.filter(loan => loan.status === 'returned').length;
      const overdueLoans = filteredLoans.filter(loan => loan.status === 'overdue').length;

      // Mock data for demonstration
      const mostUsedTools = [
        { name: 'Destornillador Phillips', count: 15 },
        { name: 'Martillo', count: 12 },
        { name: 'Taladro', count: 10 },
        { name: 'Llave Inglesa', count: 8 },
        { name: 'Alicates', count: 6 }
      ];

      const loansByCareer = [
        { career: 'Ingeniería Mecánica', count: 25 },
        { career: 'Ingeniería Industrial', count: 20 },
        { career: 'Ingeniería Eléctrica', count: 15 },
        { career: 'Ingeniería Civil', count: 12 },
        { career: 'Arquitectura', count: 8 }
      ];

      // Generate daily loans for the last 7 days
      const dailyLoans = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return {
          date: format(date, 'dd/MM'),
          count: Math.floor(Math.random() * 10) + 1
        };
      });

      // Calculate monthly growth
      const currentMonth = startOfMonth(new Date());
      const previousMonth = startOfMonth(subDays(currentMonth, 1));
      
      const currentMonthLoans = loans.filter(loan => 
        loan.loanDate && isWithinInterval(loan.loanDate.toDate(), {
          start: currentMonth,
          end: endOfMonth(new Date())
        })
      ).length;

      const previousMonthLoans = loans.filter(loan => 
        loan.loanDate && isWithinInterval(loan.loanDate.toDate(), {
          start: previousMonth,
          end: endOfMonth(previousMonth)
        })
      ).length;

      const growth = previousMonthLoans > 0 
        ? ((currentMonthLoans - previousMonthLoans) / previousMonthLoans) * 100 
        : 0;

      setReportData({
        totalLoans,
        activeLoans,
        returnedLoans,
        overdueLoans,
        mostUsedTools,
        loansByCareer,
        dailyLoans,
        monthlyStats: {
          currentMonth: currentMonthLoans,
          previousMonth: previousMonthLoans,
          growth
        }
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const reportContent = `
REPORTE DE PRÉSTAMOS DE HERRAMIENTAS
Generado el: ${format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
Período: Últimos ${dateRange} días

RESUMEN GENERAL:
- Total de préstamos: ${reportData.totalLoans}
- Préstamos activos: ${reportData.activeLoans}
- Préstamos devueltos: ${reportData.returnedLoans}
- Préstamos vencidos: ${reportData.overdueLoans}

HERRAMIENTAS MÁS UTILIZADAS:
${reportData.mostUsedTools.map(tool => `- ${tool.name}: ${tool.count} préstamos`).join('\n')}

PRÉSTAMOS POR CARRERA:
${reportData.loansByCareer.map(career => `- ${career.career}: ${career.count} préstamos`).join('\n')}

ESTADÍSTICAS MENSUALES:
- Mes actual: ${reportData.monthlyStats.currentMonth} préstamos
- Mes anterior: ${reportData.monthlyStats.previousMonth} préstamos
- Crecimiento: ${reportData.monthlyStats.growth.toFixed(1)}%
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-prestamos-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
            <span>Reportes y Estadísticas</span>
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            Análisis detallado del sistema de préstamos
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 lg:px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
            >
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="365">Último año</option>
            </select>
          </div>
          <button
            onClick={exportReport}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 lg:px-4 py-2 rounded-lg lg:rounded-xl hover:shadow-lg transition-all duration-200 text-sm lg:text-base"
          >
            <Download className="h-4 w-4 lg:h-5 lg:w-5" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <div className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Total Préstamos</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">{reportData.totalLoans}</p>
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Activos</p>
              <p className="text-xl lg:text-2xl font-bold text-blue-600 mt-1">{reportData.activeLoans}</p>
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wrench className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Devueltos</p>
              <p className="text-xl lg:text-2xl font-bold text-green-600 mt-1">{reportData.returnedLoans}</p>
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Vencidos</p>
              <p className="text-xl lg:text-2xl font-bold text-red-600 mt-1">{reportData.overdueLoans}</p>
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Monthly Growth */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <span>Crecimiento Mensual</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Mes Actual</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.monthlyStats.currentMonth}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Mes Anterior</p>
                <p className="text-lg font-semibold text-gray-900">{reportData.monthlyStats.previousMonth}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {reportData.monthlyStats.growth >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
                <span className={`text-lg font-bold ${
                  reportData.monthlyStats.growth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {reportData.monthlyStats.growth >= 0 ? '+' : ''}{reportData.monthlyStats.growth.toFixed(1)}%
                </span>
                <span className="text-gray-600">vs mes anterior</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Activity */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            <span>Actividad Diaria (7 días)</span>
          </h3>
          
          <div className="space-y-3">
            {reportData.dailyLoans.map((day, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-600 w-12">{day.date}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(day.count / 10) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 w-6">{day.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Used Tools */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-orange-500" />
            <span>Herramientas Más Utilizadas</span>
          </h3>
          
          <div className="space-y-3">
            {reportData.mostUsedTools.map((tool, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                  </div>
                  <span className="font-medium text-gray-900">{tool.name}</span>
                </div>
                <span className="text-sm font-bold text-orange-600">{tool.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Loans by Career */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Users className="h-5 w-5 text-green-500" />
            <span>Préstamos por Carrera</span>
          </h3>
          
          <div className="space-y-3">
            {reportData.loansByCareer.map((career, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-600 flex-1 truncate">{career.career}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(career.count / 25) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 w-6">{career.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl lg:rounded-2xl border border-blue-200/50 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Exportar Reporte Completo</h3>
              <p className="text-sm text-gray-600">Descarga un reporte detallado con todas las estadísticas</p>
            </div>
          </div>
          <button
            onClick={exportReport}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <Download className="h-5 w-5" />
            <span>Descargar Reporte</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;