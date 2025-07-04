import React, { useState, useEffect } from 'react';
import { X, Save, Search, User, Wrench } from 'lucide-react';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Tool, Student } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { addDays } from 'date-fns';

interface LoanModalProps {
  onClose: () => void;
}

const LoanModal: React.FC<LoanModalProps> = ({ onClose }) => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [toolSearchTerm, setToolSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // No requerimos userProfile para crear préstamo
 
  useEffect(() => {
    fetchAvailableTools();
    fetchStudents();
  }, []);

  const fetchAvailableTools = async () => {
    try {
      const toolsQuery = query(
        collection(db, 'tools'),
        where('isAvailable', '==', true)
      );
      const querySnapshot = await getDocs(toolsQuery);
      const toolsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tool[];
      setAvailableTools(toolsData);
    } catch (error) {
      console.error('Error fetching tools:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'students'));
      const studentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const generateTicketCode = (): string => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TL${year}${month}${day}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTool || !selectedStudent) {
      setError('Por favor selecciona una herramienta y un estudiante');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loanDate = new Date();
      const dueDate = addDays(loanDate, 15);
      const ticketCode = generateTicketCode();

      // Crear el préstamo solo con herramienta y estudiante
      await addDoc(collection(db, 'loans'), {
        toolId: selectedTool.id,
        studentId: selectedStudent.id,
        loanDate,
        dueDate,
        status: 'active',
        ticketCode,
        notes: notes || '',
        createdAt: new Date()
      });

      // Actualizar disponibilidad de la herramienta
      await updateDoc(doc(db, 'tools', selectedTool.id), {
        isAvailable: false,
        updatedAt: new Date()
      });

      onClose();
    } catch (error) {
      console.error('Error creating loan:', error);
      setError('Error al crear el préstamo');
    } finally {
      setLoading(false);
    }
  };

  const filteredTools = availableTools.filter(tool =>
    tool.name.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(toolSearchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    student.career.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

 

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nuevo Préstamo</h2>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tool Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Wrench className="h-5 w-5" />
                <span>Seleccionar Herramienta</span>
              </h3>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar herramientas..."
                  value={toolSearchTerm}
                  onChange={(e) => setToolSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-2">
                {filteredTools.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => {
                      setSelectedTool(tool);
                      console.log('Tool selected:', tool);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedTool?.id === tool.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <h4 className="font-medium text-gray-900">{tool.name}</h4>
                    <p className="text-sm text-gray-600">{tool.description}</p>
                    <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {tool.category}
                    </span>
                  </div>
                ))}
              </div>

              {selectedTool && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-medium text-blue-900">Herramienta Seleccionada:</h4>
                  <p className="text-blue-800">{selectedTool.name}</p>
                </div>
              )}
            </div>

            {/* Student Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Seleccionar Estudiante</span>
              </h3>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar estudiantes..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-2">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => {
                      setSelectedStudent(student);
                      console.log('Student selected:', student);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedStudent?.id === student.id
                        ? 'bg-green-50 border-2 border-green-500'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <h4 className="font-medium text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                    <p className="text-sm text-gray-600">{student.career}</p>
                  </div>
                ))}
              </div>

              {selectedStudent && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl">
                  <h4 className="font-medium text-green-900">Estudiante Seleccionado:</h4>
                  <p className="text-green-800">{selectedStudent.name}</p>
                  <p className="text-sm text-green-700">{selectedStudent.career}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notas (Opcional)
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Agregar notas sobre el préstamo..."
            />
          </div>

          {/* Submit */}
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
              disabled={loading || !selectedTool || !selectedStudent}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Crear Préstamo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanModal;