import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Wrench, 
  Users, 
  ClipboardList, 
  BarChart3
} from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Inicio' },
    { to: '/tools', icon: Wrench, label: 'Herramientas' },
    { to: '/loans', icon: ClipboardList, label: 'Préstamos' },
    { to: '/students', icon: Users, label: 'Estudiantes' },
    { to: '/reports', icon: BarChart3, label: 'Reportes' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100' : ''}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;