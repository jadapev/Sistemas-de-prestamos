import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Users, 
  ClipboardList, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format, isAfter, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardStats {
  totalTools: number;
  availableTools: number;
  totalStudents: number;
  activeLoans: number;
  overdueLoans: number;
  recentActivity: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTools: 0,
    availableTools: 0,
    totalStudents: 0,
    activeLoans: 0,
    overdueLoans: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch tools
        const toolsQuery = await getDocs(collection(db, 'tools'));
        const tools = toolsQuery.docs.map(doc => doc.data());
        const availableTools = tools.filter(tool => tool.isAvailable).length;

        // Fetch students
        const studentsQuery = await getDocs(collection(db, 'students'));
        
        // Fetch active loans
        const activeLoansQuery = await getDocs(
          query(collection(db, 'loans'), where('status', '==', 'active'))
        );
        const activeLoans = activeLoansQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Calculate overdue loans
        const overdueLoans = activeLoans.filter(loan => 
          isAfter(new Date(), addDays(loan.loanDate.toDate(), 15))
        );

        setStats({
          totalTools: tools.length,
          availableTools,
          totalStudents: studentsQuery.docs.length,
          activeLoans: activeLoans.length,
          overdueLoans: overdueLoans.length,
          recentActivity: activeLoans.slice(-5)
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Herramientas',
      value: stats.totalTools,
      icon: Wrench,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Herramientas Disponibles',
      value: stats.availableTools,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Estudiantes Registrados',
      value: stats.totalStudents,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Préstamos Activos',
      value: stats.activeLoans,
      icon: ClipboardList,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Préstamos Vencidos',
      value: stats.overdueLoans,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 lg:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 lg:px-4 py-2 rounded-xl text-sm lg:text-base">
          <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5" />
          <span className="font-medium">Sistema Activo</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-3 lg:p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-2 lg:mb-0">
                <p className="text-xs lg:text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-xl lg:text-3xl font-bold text-gray-900 mt-1 lg:mt-2">{card.value}</p>
              </div>
              <div className={`w-8 h-8 lg:w-12 lg:h-12 ${card.bgColor} rounded-lg lg:rounded-xl flex items-center justify-center self-end lg:self-auto`}>
                <card.icon className={`h-4 w-4 lg:h-6 lg:w-6 bg-gradient-to-r ${card.color} bg-clip-text text-transparent`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Actividad Reciente</h2>
            <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
          </div>
          
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-3 lg:space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 lg:space-x-4 p-2 lg:p-3 bg-gray-50/80 rounded-lg lg:rounded-xl">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="h-3 w-3 lg:h-5 lg:w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Préstamo #{activity.ticketCode}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(activity.loanDate.toDate(), "d MMM yyyy 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full flex-shrink-0">
                    Activo
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 lg:py-8">
              <ClipboardList className="h-8 w-8 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-3 lg:mb-4" />
              <p className="text-gray-500 text-sm lg:text-base">No hay actividad reciente</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">Resumen Rápido</h2>
          
          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg lg:rounded-xl">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 text-sm lg:text-base">Disponibilidad</p>
                  <p className="text-xs lg:text-sm text-gray-600">Herramientas disponibles</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {stats.totalTools > 0 ? Math.round((stats.availableTools / stats.totalTools) * 100) : 0}%
                </p>
                <p className="text-xs lg:text-sm text-gray-600">
                  {stats.availableTools}/{stats.totalTools}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg lg:rounded-xl">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <AlertTriangle className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 text-sm lg:text-base">Préstamos Vencidos</p>
                  <p className="text-xs lg:text-sm text-gray-600">Requieren atención</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg lg:text-2xl font-bold text-red-600">{stats.overdueLoans}</p>
                <p className="text-xs lg:text-sm text-gray-600">de {stats.activeLoans}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg lg:rounded-xl">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-purple-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 text-sm lg:text-base">Utilización</p>
                  <p className="text-xs lg:text-sm text-gray-600">Herramientas en uso</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {stats.totalTools > 0 ? Math.round(((stats.totalTools - stats.availableTools) / stats.totalTools) * 100) : 0}%
                </p>
                <p className="text-xs lg:text-sm text-gray-600">
                  {stats.totalTools - stats.availableTools}/{stats.totalTools}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;