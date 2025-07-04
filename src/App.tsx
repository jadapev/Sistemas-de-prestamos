import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ToolList from './components/Tools/ToolList';
import LoanList from './components/Loans/LoanList';
import StudentList from './components/Students/StudentList';
import OverdueList from './components/Overdue/OverdueList';
import ReportsDashboard from './components/Reports/ReportsDashboard';
import UserManagement from './components/Users/UserManagement';
import SettingsPage from './components/Settings/SettingsPage';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import MobileBottomNav from './components/Layout/MobileBottomNav';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header onMenuToggle={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />
      <div className="flex">
        <Sidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
        <main className="flex-1 lg:ml-0 pb-20 lg:pb-0">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tools" element={<ToolList />} />
        <Route path="/loans" element={<LoanList />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/overdue" element={<OverdueList />} />
        <Route path="/reports" element={<ReportsDashboard />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AppLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;