import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Phone, 
  Palette, 
  Database, 
  Lock, 
  Globe, 
  HelpCircle, 
  FileText, 
  Shield, 
  LogOut 
} from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="flex flex-col w-full h-screen bg-gray-100">
      {/* Header */}
      <div className="flex items-center p-4 pt-8">
        <div className="bg-white rounded-full p-2 shadow-sm">
          <ChevronLeft size={24} />
        </div>
        <h1 className="ml-6 text-2xl font-black tracking-wider">PARAMETRES</h1>
      </div>
      
      {/* Account Section */}
      <div className="px-4 pt-8">
        <h2 className="text-lg font-medium mb-3">Compte</h2>
        
        <div className="bg-white rounded-xl shadow-sm mb-6">
          {/* Email */}
          <div className="flex items-center px-4 py-3 border-b border-gray-100">
            <div className="bg-gray-50 p-2 rounded-lg">
              <Mail size={20} className="text-gray-800" />
            </div>
            <div className="ml-3 flex-grow">
              <div className="font-medium">Adresse mail</div>
            </div>
            <div className="text-gray-500">exemple@gmail.com</div>
          </div>
          
          {/* Phone */}
          <div className="flex items-center px-4 py-3 border-b border-gray-100">
            <div className="bg-gray-50 p-2 rounded-lg">
              <Phone size={20} className="text-gray-800" />
            </div>
            <div className="ml-3 flex-grow">
              <div className="font-medium">Numéro de téléphone</div>
            </div>
            <div className="text-gray-500">+33644354111</div>
          </div>
          
          {/* Personalization */}
          <div className="flex items-center px-4 py-3 border-b border-gray-100">
            <div className="bg-gray-50 p-2 rounded-lg">
              <Palette size={20} className="text-gray-800" />
            </div>
            <div className="ml-3 flex-grow">
              <div className="font-medium">Personnalisation</div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
          
          {/* Data Management */}
          <div className="flex items-center px-4 py-3 border-b border-gray-100">
            <div className="bg-gray-50 p-2 rounded-lg">
              <Database size={20} className="text-gray-800" />
            </div>
            <div className="ml-3 flex-grow">
              <div className="font-medium">Gestion des données</div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
          
          {/* Security */}
          <div className="flex items-center px-4 py-3">
            <div className="bg-gray-50 p-2 rounded-lg">
              <Lock size={20} className="text-gray-800" />
            </div>
            <div className="ml-3 flex-grow">
              <div className="font-medium">Sécurité</div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* About the Application Section */}
      <div className="px-4">
        <h2 className="text-lg font-medium mb-3">À propos de l'application</h2>
        
        <div className="bg-white rounded-xl shadow-sm mb-6">
          {/* Language */}
          <div className="flex items-center px-4 py-3 border-b border-gray-100">
            <div className="bg-gray-50 p-2 rounded-lg">
              <Globe size={20} className="text-gray-800" />
            </div>
            <div className="ml-3 flex-grow">
              <div className="font-medium">Langue</div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">Français</span>
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          </div>
          
          {/* Help Center */}
          <div className="flex items-center px-4 py-3 border-b border-gray-100">
            <div className="bg-gray-50 p-2 rounded-lg">
              <HelpCircle size={20} className="text-gray-800" />
            </div>
            <div className="ml-3 flex-grow">
              <div className="font-medium">Centre d'assistance</div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
          
          {/* Terms of Service */}
          <div className="flex items-center px-4 py-3 border-b border-gray-100">
            <div className="bg-gray-50 p-2 rounded-lg">
              <FileText size={20} className="text-gray-800" />
            </div>
            <div className="ml-3 flex-grow">
              <div className="font-medium">Conditions d'utilisation</div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
          
          {/* Privacy Policy */}
          <div className="flex items-center px-4 py-3 border-b border-gray-100">
            <div className="bg-gray-50 p-2 rounded-lg">
              <Shield size={20} className="text-gray-800" />
            </div>
            <div className="ml-3 flex-grow">
              <div className="font-medium">Politique de confidentialité</div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
          
          {/* Version */}
          <div className="flex items-center px-4 py-3">
            <div className="bg-gray-50 p-2 rounded-lg">
              <div className="font-bold text-gray-800">P</div>
            </div>
            <div className="ml-3 flex-grow">
              <div className="font-medium">Pik-It pour IOS</div>
            </div>
            <div className="text-gray-500">1.2.401</div>
          </div>
        </div>
      </div>
      
      {/* Logout Button */}
      <div className="px-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center px-4 py-3">
            <div className="bg-gray-50 p-2 rounded-lg">
              <LogOut size={20} className="text-gray-800" />
            </div>
            <div className="ml-3 flex-grow">
              <div className="font-medium">Se déconnecter</div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;