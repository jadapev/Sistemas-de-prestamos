import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Student } from '../../types';

interface StudentModalProps {
  student?: Student | null;
  onClose: () => void;
}

const StudentModal: React.FC<StudentModalProps> = ({ student, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    career: 'Ingeniería Industrial',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const careers = [
    'Ingeniería Industrial',
    'Ingeniería Mecánica', 
    'Ingeniería Eléctrica',
    'Ingeniería Civil',
    'Arquitectura'
  ];

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        studentId: student.studentId,
        career: student.career,
        email: student.email,
        phone: student.phone
      });
    }
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (student) {
        // Update existing student
        await updateDoc(doc(db, 'students', student.id), {
          ...formData,
          updatedAt: new Date()
        });
      } else {
        // Create new student
        await addDoc(collection(db, 'students'), {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving student:', error);
      setError('Error al guardar el estudiante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {student ? 'Editar Estudiante' : 'Nuevo Estudiante'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Ej: Juan Pérez García"
            />
          </div>

          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
              ID de Estudiante
            </label>
            <input
              id="studentId"
              name="studentId"
              type="text"
              required
              value={formData.studentId}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Ej: 2024001234"
            />
          </div>

          <div>
            <label htmlFor="career" className="block text-sm font-medium text-gray-700 mb-2">
              Carrera
            </label>
            <select
              id="career"
              name="career"
              value={formData.career}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {careers.map(career => (
                <option key={career} value={career}>
                  {career}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="estudiante@universidad.edu"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Ej: +1 234 567 8900"
            />
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>{student ? 'Actualizar' : 'Crear'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;