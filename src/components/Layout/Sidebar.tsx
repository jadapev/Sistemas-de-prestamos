import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Wrench, 
  Users, 
  ClipboardList, 
  AlertTriangle, 
  BarChart3,
  UserPlus,
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { userProfile } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/tools', icon: Wrench, label: 'Herramientas' },
    { to: '/students', icon: Users, label: 'Estudiantes' },
    { to: '/loans', icon: ClipboardList, label: 'Préstamos' },
    { to: '/overdue', icon: AlertTriangle, label: 'Vencidos' },
    { to: '/reports', icon: BarChart3, label: 'Reportes' },
  ];

  const superAdminItems = [
    { to: '/users', icon: UserPlus, label: 'Usuarios' },
    { to: '/settings', icon: Settings, label: 'Configuración' },
  ];

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-md border-r border-gray-200/50 
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">ToolLoan</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-4 lg:mt-8 px-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-700 hover:bg-gray-100/80 hover:text-blue-600'
                  }`
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {userProfile?.role === 'superadmin' && (
            <>
              <div className="mt-8 pt-8 border-t border-gray-200/50">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Super Admin
                </p>
                <div className="space-y-2">
                  {superAdminItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                            : 'text-gray-700 hover:bg-gray-100/80 hover:text-purple-600'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            </>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;