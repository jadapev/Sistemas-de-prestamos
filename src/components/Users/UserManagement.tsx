import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  User,
  Shield,
  ShieldCheck,
  Calendar,
  Mail
} from 'lucide-react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { User as UserType } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import UserModal from './UserModal';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const { userProfile } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserType[];
      
      // Add the default admin if not in the list
      const hasDefaultAdmin = usersData.some(user => user.email === 'admin@gmail.com');
      if (!hasDefaultAdmin) {
        usersData.unshift({
          id: 'default-admin-uid',
          email: 'admin@gmail.com',
          name: 'Administrador Principal',
          role: 'superadmin',
          createdAt: new Date('2024-01-01')
        });
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleDelete = async (userId: string) => {
    if (userId === 'default-admin-uid') {
      alert('No se puede eliminar el administrador principal del sistema');
      return;
    }

    if (userId === userProfile?.id) {
      alert('No puedes eliminar tu propia cuenta');
      return;
    }

    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleEdit = (user: UserType) => {
    if (user.id === 'default-admin-uid') {
      alert('No se puede editar el administrador principal del sistema');
      return;
    }
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const getRoleIcon = (role: string) => {
    return role === 'superadmin' ? ShieldCheck : Shield;
  };

  const getRoleColor = (role: string) => {
    return role === 'superadmin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const getRoleLabel = (role: string) => {
    return role === 'superadmin' ? 'Super Admin' : 'Administrador';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only superadmins can access this page
  if (userProfile?.role !== 'superadmin') {
    return (
      <div className="p-4 lg:p-6">
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Restringido</h3>
          <p className="text-gray-600">Solo los super administradores pueden gestionar usuarios.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <ShieldCheck className="h-6 w-6 lg:h-8 lg:w-8 text-purple-500" />
            <span>Gestión de Usuarios</span>
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Administra los usuarios del sistema</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 text-sm lg:text-base"
        >
          <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 lg:h-5 lg:w-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 lg:pl-10 pr-4 py-2 lg:py-3 bg-gray-50/80 border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm lg:text-base"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 lg:px-4 py-2 lg:py-3 bg-gray-50/80 border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm lg:text-base"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="superadmin">Super Administradores</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredUsers.map((user) => {
          const RoleIcon = getRoleIcon(user.role);
          
          return (
            <div
              key={user.id}
              className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 truncate">{user.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        <RoleIcon className="h-3 w-3" />
                        <span>{getRoleLabel(user.role)}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-1.5 lg:p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                    title="Editar"
                  >
                    <Edit2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-1.5 lg:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Creado: {format(user.createdAt, "d MMM yyyy", { locale: es })}</span>
                </div>
                {user.id === userProfile?.id && (
                  <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    <span>Tu cuenta</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 lg:py-12">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
            <Search className="h-6 w-6 lg:h-8 lg:w-8 text-gray-400" />
          </div>
          <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
          <p className="text-gray-600 text-sm lg:text-base">Intenta cambiar los filtros o agregar un nuevo usuario.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <UserModal
          user={selectedUser}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default UserManagement;