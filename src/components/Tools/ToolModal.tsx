import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Tool } from '../../types';
import QRCode from 'qrcode';

interface ToolModalProps {
  tool?: Tool | null;
  onClose: () => void;
}

const ToolModal: React.FC<ToolModalProps> = ({ tool, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Mecánica'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Mecánica', 'Electrónica', 'Carpintería', 'Soldadura', 'Medición'];

  useEffect(() => {
    if (tool) {
      setFormData({
        name: tool.name,
        description: tool.description,
        category: tool.category
      });
    }
  }, [tool]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateQRCode = async (toolId: string): Promise<string> => {
    try {
      const qrData = JSON.stringify({
        toolId,
        type: 'tool',
        timestamp: new Date().toISOString()
      });
      return await QRCode.toDataURL(qrData);
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tool) {
        // Update existing tool
        await updateDoc(doc(db, 'tools', tool.id), {
          ...formData,
          updatedAt: new Date()
        });
      } else {
        // Create new tool
        const docRef = await addDoc(collection(db, 'tools'), {
          ...formData,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          qrCode: '' // Will be updated after getting the document ID
        });

        // Generate QR code with the document ID
        const qrCode = await generateQRCode(docRef.id);
        await updateDoc(docRef, { qrCode });
      }

      onClose();
    } catch (error) {
      console.error('Error saving tool:', error);
      setError('Error al guardar la herramienta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {tool ? 'Editar Herramienta' : 'Nueva Herramienta'}
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
              Nombre de la Herramienta
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Ej: Destornillador Phillips"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              required
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Describe las características de la herramienta..."
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
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
                  <span>{tool ? 'Actualizar' : 'Crear'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ToolModal;