import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  User,
  GraduationCap,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Student } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import StudentModal from './StudentModal';

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCareer, setSelectedCareer] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const careers = ['all', 'Ingeniería Industrial', 'Ingeniería Mecánica', 'Ingeniería Eléctrica', 'Ingeniería Civil', 'Arquitectura'];

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedCareer]);

  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'students'));
      const studentsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
        };
      }) as Student[];
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCareer !== 'all') {
      filtered = filtered.filter(student => student.career === selectedCareer);
    }

    setFilteredStudents(filtered);
  };

  const handleDelete = async (studentId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este estudiante?')) {
      try {
        await deleteDoc(doc(db, 'students', studentId));
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    fetchStudents();
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Estudiantes</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Gestiona la base de datos de estudiantes</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 text-sm lg:text-base"
        >
          <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
          <span>Nuevo Estudiante</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 lg:h-5 lg:w-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, ID o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 lg:pl-10 pr-4 py-2 lg:py-3 bg-gray-50/80 border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
            <select
              value={selectedCareer}
              onChange={(e) => setSelectedCareer(e.target.value)}
              className="px-3 lg:px-4 py-2 lg:py-3 bg-gray-50/80 border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
            >
              {careers.map(career => (
                <option key={career} value={career}>
                  {career === 'all' ? 'Todas las carreras' : career}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 truncate">{student.name}</h3>
                  <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleEdit(student)}
                  className="p-1.5 lg:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Editar"
                >
                  <Edit2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                </button>
                <button
                  onClick={() => handleDelete(student.id)}
                  className="p-1.5 lg:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Eliminar"
                >
                  <Trash2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <GraduationCap className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{student.career}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>Registrado: {format(student.createdAt, "d MMM yyyy", { locale: es })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-8 lg:py-12">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
            <Search className="h-6 w-6 lg:h-8 lg:w-8 text-gray-400" />
          </div>
          <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No se encontraron estudiantes</h3>
          <p className="text-gray-600 text-sm lg:text-base">Intenta cambiar los filtros o agregar un nuevo estudiante.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <StudentModal
          student={selectedStudent}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default StudentList;