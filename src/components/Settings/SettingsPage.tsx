import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Bell, 
  Clock, 
  Database, 
  Shield, 
  Mail,
  Smartphone,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface SystemSettings {
  loanDuration: number;
  overdueNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoBackup: boolean;
  backupFrequency: string;
  maintenanceMode: boolean;
  maxLoansPerStudent: number;
  requireApproval: boolean;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    loanDuration: 15,
    overdueNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    backupFrequency: 'daily',
    maintenanceMode: false,
    maxLoansPerStudent: 3,
    requireApproval: false
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSaved(true);
    setLoading(false);
    
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Settings className="h-6 w-6 lg:h-8 lg:w-8 text-gray-500" />
            <span>Configuración del Sistema</span>
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            Personaliza el comportamiento del sistema de préstamos
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm lg:text-base ${
            saved 
              ? 'bg-green-500 text-white' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="h-4 w-4 lg:h-5 lg:w-5" />
          )}
          <span>{saved ? 'Guardado' : 'Guardar Cambios'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Loan Settings */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <span>Configuración de Préstamos</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración de préstamo (días)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={settings.loanDuration}
                onChange={(e) => handleChange('loanDuration', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tiempo máximo que un estudiante puede tener una herramienta
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo préstamos por estudiante
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.maxLoansPerStudent}
                onChange={(e) => handleChange('maxLoansPerStudent', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Requerir aprobación</p>
                <p className="text-xs text-gray-500">Los préstamos necesitan aprobación manual</p>
              </div>
              <button
                onClick={() => handleChange('requireApproval', !settings.requireApproval)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.requireApproval ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.requireApproval ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Bell className="h-5 w-5 text-green-500" />
            <span>Notificaciones</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Notificaciones de vencimiento</p>
                  <p className="text-xs text-gray-500">Alertas cuando los préstamos están por vencer</p>
                </div>
              </div>
              <button
                onClick={() => handleChange('overdueNotifications', !settings.overdueNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.overdueNotifications ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.overdueNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Notificaciones por email</p>
                  <p className="text-xs text-gray-500">Enviar recordatorios por correo electrónico</p>
                </div>
              </div>
              <button
                onClick={() => handleChange('emailNotifications', !settings.emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Notificaciones SMS</p>
                  <p className="text-xs text-gray-500">Enviar mensajes de texto</p>
                </div>
              </div>
              <button
                onClick={() => handleChange('smsNotifications', !settings.smsNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.smsNotifications ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Database className="h-5 w-5 text-indigo-500" />
            <span>Sistema</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Respaldo automático</p>
                <p className="text-xs text-gray-500">Crear copias de seguridad automáticamente</p>
              </div>
              <button
                onClick={() => handleChange('autoBackup', !settings.autoBackup)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoBackup ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.autoBackup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia de respaldo
                </label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => handleChange('backupFrequency', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="hourly">Cada hora</option>
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Modo mantenimiento</p>
                <p className="text-xs text-gray-500">Deshabilitar el sistema temporalmente</p>
              </div>
              <button
                onClick={() => handleChange('maintenanceMode', !settings.maintenanceMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-500" />
            <span>Seguridad</span>
          </h2>
          
          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-800">Configuración de Seguridad</p>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Las configuraciones de seguridad requieren permisos especiales
              </p>
            </div>

            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Cambiar contraseña de administrador
            </button>

            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Configurar autenticación de dos factores
            </button>

            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Ver logs de seguridad
            </button>
          </div>
        </div>
      </div>

      {/* Save Confirmation */}
      {saved && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <Save className="h-4 w-4" />
          <span>Configuración guardada exitosamente</span>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;