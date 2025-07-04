import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, QrCode, Edit2, Trash2 } from 'lucide-react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Tool } from '../../types';
import ToolModal from './ToolModal';
import QRCodeModal from './QRCodeModal';

const ToolList: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const categories = ['all', 'Mecánica', 'Electrónica', 'Carpintería', 'Soldadura', 'Medición'];

  useEffect(() => {
    fetchTools();
  }, []);

  useEffect(() => {
    filterTools();
  }, [tools, searchTerm, selectedCategory]);

  const fetchTools = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'tools'));
      const toolsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tool[];
      setTools(toolsData);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTools = () => {
    let filtered = tools;

    if (searchTerm) {
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    setFilteredTools(filtered);
  };

  const handleDelete = async (toolId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta herramienta?')) {
      try {
        await deleteDoc(doc(db, 'tools', toolId));
        fetchTools();
      } catch (error) {
        console.error('Error deleting tool:', error);
      }
    }
  };

  const handleEdit = (tool: Tool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  };

  const handleShowQR = (tool: Tool) => {
    setSelectedTool(tool);
    setIsQRModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTool(null);
    fetchTools();
  };

  const handleCloseQRModal = () => {
    setIsQRModalOpen(false);
    setSelectedTool(null);
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Herramientas</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Gestiona el inventario de herramientas</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 text-sm lg:text-base"
        >
          <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
          <span>Nueva Herramienta</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 lg:h-5 lg:w-5" />
            <input
              type="text"
              placeholder="Buscar herramientas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 lg:pl-10 pr-4 py-2 lg:py-3 bg-gray-50/80 border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 lg:px-4 py-2 lg:py-3 bg-gray-50/80 border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Todas las categorías' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3 lg:mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-1 truncate">{tool.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{tool.description}</p>
                <span className="inline-block px-2 lg:px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {tool.category}
                </span>
              </div>
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ml-2 ${tool.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>

            <div className="flex items-center justify-between pt-3 lg:pt-4 border-t border-gray-200/50">
              <span className={`text-sm font-medium ${tool.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {tool.isAvailable ? 'Disponible' : 'En préstamo'}
              </span>
              <div className="flex items-center space-x-1 lg:space-x-2">
                <button
                  onClick={() => handleShowQR(tool)}
                  className="p-1.5 lg:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Ver código QR"
                >
                  <QrCode className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                </button>
                <button
                  onClick={() => handleEdit(tool)}
                  className="p-1.5 lg:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Editar"
                >
                  <Edit2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                </button>
                <button
                  onClick={() => handleDelete(tool.id)}
                  className="p-1.5 lg:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Eliminar"
                >
                  <Trash2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-8 lg:py-12">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
            <Search className="h-6 w-6 lg:h-8 lg:w-8 text-gray-400" />
          </div>
          <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No se encontraron herramientas</h3>
          <p className="text-gray-600 text-sm lg:text-base">Intenta cambiar los filtros o agregar una nueva herramienta.</p>
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <ToolModal
          tool={selectedTool}
          onClose={handleCloseModal}
        />
      )}

      {isQRModalOpen && selectedTool && (
        <QRCodeModal
          tool={selectedTool}
          onClose={handleCloseQRModal}
        />
      )}
    </div>
  );
};

export default ToolList;