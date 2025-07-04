import React from 'react';
import { X, Download, Printer as Print } from 'lucide-react';
import { Tool } from '../../types';

interface QRCodeModalProps {
  tool: Tool;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ tool, onClose }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `qr-code-${tool.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = tool.qrCode;
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Código QR - ${tool.name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                padding: 20px; 
              }
              .qr-container { 
                text-align: center; 
                border: 2px solid #000; 
                padding: 20px; 
                border-radius: 10px; 
              }
              .qr-code { 
                max-width: 200px; 
                height: auto; 
              }
              .tool-info { 
                margin-top: 10px; 
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <img src="${tool.qrCode}" alt="QR Code" class="qr-code" />
              <div class="tool-info">
                <h3>${tool.name}</h3>
                <p>${tool.description}</p>
                <p><strong>Categoría:</strong> ${tool.category}</p>
                <p><strong>ID:</strong> ${tool.id}</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Código QR</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 text-center">
          <div className="bg-white p-6 rounded-xl border-2 border-gray-200 inline-block mb-6">
            <img
              src={tool.qrCode}
              alt={`Código QR para ${tool.name}`}
              className="w-48 h-48 mx-auto"
            />
          </div>

          <div className="text-left bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{tool.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{tool.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Categoría:</span>
              <span className="font-medium text-gray-900">{tool.category}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-500">ID:</span>
              <span className="font-mono text-xs text-gray-900">{tool.id}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
            >
              <Download className="h-5 w-5" />
              <span>Descargar</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
            >
              <Print className="h-5 w-5" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;