import React from 'react';
import { Home, Trophy, Search, User } from 'lucide-react';

const DefisPage = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header avec fond rouge */}
      <div className="bg-red-500 p-4 pb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-white">DEFIS</h1>
          <div className="flex space-x-2">
            <div className="bg-white rounded-full px-3 py-1 flex items-center">
              <span className="font-semibold">150 pts</span>
            </div>
            <div className="bg-white rounded-full px-3 py-1 flex items-center">
              <span className="font-semibold">1280</span>
              <span className="ml-1 text-yellow-500">C</span>
            </div>
          </div>
        </div>

        {/* Onglets de navigation */}
        <div className="bg-gray-900 rounded-full p-1 flex">
          <button className="bg-white text-black rounded-full py-2 px-4 font-medium flex items-center flex-1">
            <span>Défis</span>
            <Trophy size={16} className="ml-1" />
          </button>
          <button className="text-white rounded-full py-2 px-4 font-medium flex items-center flex-1">
            <span>Cadeaux</span>
            <span className="ml-1">🎁</span>
          </button>
          <button className="text-white rounded-full py-2 px-4 font-medium flex items-center flex-1">
            <span>Bons plans</span>
            <span className="ml-1">💸</span>
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 p-4 space-y-4 overflow-auto">
        {/* Défi Photographe */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          {/* Zone jaune (illustration) */}
          <div className="bg-yellow-400 w-full h-16 rounded-lg mb-3"></div>
          
          {/* Info du défi */}
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <h2 className="font-bold text-lg">Photographe</h2>
              <span className="ml-1">📸</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-gray-600 mr-1">Récompense</span>
                <span className="font-medium">230</span>
                <span className="text-yellow-500 ml-1">C</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 mr-1">EXP</span>
                <span className="font-medium">100</span>
              </div>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="flex justify-between text-sm mb-1">
            <span>Validez 5 photos</span>
            <div className="flex items-center">
              <span className="text-gray-600 mr-1">Complétion</span>
              <span className="font-medium">100 %</span>
            </div>
          </div>
          <div className="bg-gray-200 h-2 rounded-full w-full mb-3">
            <div className="bg-red-500 h-2 rounded-full w-full"></div>
          </div>
          
          {/* Bouton de récompense */}
          <button className="bg-red-500 text-white py-2 px-4 rounded-full font-medium w-full">
            Récupérer la récompense
          </button>
        </div>

        {/* Défi Gourmand */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          {/* Zone violette (illustration) */}
          <div className="bg-purple-300 w-full h-16 rounded-lg mb-3"></div>
          
          {/* Info du défi */}
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <h2 className="font-bold text-lg">Gourmand</h2>
              <span className="ml-1">🍪</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-gray-600 mr-1">Récompense</span>
                <span className="font-medium">230</span>
                <span className="text-yellow-500 ml-1">C</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 mr-1">EXP</span>
                <span className="font-medium">100</span>
              </div>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="flex justify-between text-sm mb-1">
            <span>Prenez 10 aliments en photo</span>
            <div className="flex items-center">
              <span className="text-gray-600 mr-1">Complétion</span>
              <span className="font-medium">50 %</span>
            </div>
          </div>
          <div className="bg-gray-200 h-2 rounded-full w-full mb-3">
            <div className="bg-red-500 h-2 rounded-full w-1/2"></div>
          </div>
          
          {/* Bouton de récompense (désactivé) */}
          <button className="bg-red-300 text-white py-2 px-4 rounded-full font-medium w-full">
            Récupérer la récompense
          </button>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="mt-auto">
        <div className="flex justify-around items-center bg-black rounded-full mx-4 mb-4 py-3 px-6">
          <Home size={24} color="white" />
          <div className="bg-red-800 rounded-full p-3">
            <Trophy size={24} color="white" />
          </div>
          <div className="bg-white rounded-full p-2">
            <div className="transform rotate-45">
              <span className="text-gray-800 font-bold text-xl">+</span>
            </div>
          </div>
          <Search size={24} color="white" />
          <User size={24} color="white" />
        </div>
      </div>
    </div>
  );
};

export default DefisPage;