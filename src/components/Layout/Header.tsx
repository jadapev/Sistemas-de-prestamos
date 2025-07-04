import React from 'react';
import { LogOut, User, Settings, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ImageLogo from '../../assets/unefa-logo.png'

interface HeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { userProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="w-12 h-12  rounded-xl flex items-center justify-center">
              <img src={ImageLogo} alt="" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sistema de prestamos
              </h1>
              <p className="text-sm text-gray-500">Gestión de Préstamos</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-3 bg-gray-50/80 rounded-full px-2 sm:px-4 py-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <div className="text-xs sm:text-sm hidden sm:block">
                <p className="font-medium text-gray-900">{userProfile?.name}</p>
                <p className="text-gray-500 capitalize">{userProfile?.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;