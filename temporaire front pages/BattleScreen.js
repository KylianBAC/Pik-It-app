import React from 'react';
import { Search, Filter, Home, Trophy, User } from 'lucide-react';

// Composant principal
const BattleScreen = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header avec status bar */}
      <div className="p-4 bg-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black">BATTLE</h1>
          <div className="flex space-x-2">
            <div className="bg-white rounded-full px-3 py-1 flex items-center">
              <span className="font-semibold">150 pts</span>
            </div>
            <div className="bg-yellow-400 rounded-full px-3 py-1 flex items-center">
              <span className="font-semibold">1280</span>
              <span className="ml-1 text-yellow-800">C</span>
            </div>
          </div>
        </div>

        {/* Boutons principaux */}
        <div className="flex space-x-3 mb-6">
          <button className="w-1/2 bg-red-400 text-white py-3 rounded-full font-medium shadow-md">
            Créer une partie
          </button>
          <button className="w-1/2 bg-yellow-400 text-black py-3 rounded-full font-medium shadow-md">
            Rejoindre une partie
          </button>
        </div>

        {/* Section de recherche */}
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Chercher une partie</h2>
          <div className="relative flex items-center mb-3">
            <input
              type="text"
              placeholder="Rechercher un thème, ou nom de partie"
              className="w-full bg-gray-200 rounded-lg py-2 px-4 pr-10"
            />
            <Search className="absolute right-10 text-gray-500" size={20} />
            <Filter className="absolute right-3 text-red-400" size={20} />
          </div>

          {/* Tags de filtre */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="bg-red-200 rounded-full px-3 py-1 flex items-center">
              <span>Nature</span>
              <span className="ml-1 font-bold">×</span>
            </div>
            <div className="bg-red-200 rounded-full px-3 py-1 flex items-center">
              <span>Musique</span>
              <span className="ml-1 font-bold">×</span>
            </div>
            <div className="bg-red-200 rounded-full px-3 py-1 flex items-center">
              <span>Art</span>
              <span className="ml-1 font-bold">×</span>
            </div>
            <div className="bg-red-200 rounded-full px-3 py-1 flex items-center">
              <span>Mode 1</span>
              <span className="ml-1 font-bold">×</span>
            </div>
            <div className="bg-red-200 rounded-full px-3 py-1 flex items-center">
              <span>+2</span>
            </div>
          </div>
        </div>

        {/* Parties suggérées */}
        <h2 className="text-xl font-bold mb-3">Suggérées</h2>
        <div className="flex space-x-3 mb-6">
          {/* Carte Sport */}
          <div className="w-1/2 bg-indigo-100 rounded-lg p-3 shadow-sm">
            <div className="flex items-center mb-12">
              <div className="bg-blue-400 rounded-full p-2">
                <div className="flex items-center">
                  <img src="/api/placeholder/32/32" alt="Sports icon" className="rounded-full" />
                </div>
              </div>
              <span className="ml-2 font-semibold">Sports</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center">
                <span className="font-semibold">6</span>
                <User size={16} className="ml-1" />
              </div>
              <button className="bg-white rounded-lg px-3 py-1 font-medium">
                Rejoindre
              </button>
            </div>
          </div>

          {/* Carte Art */}
          <div className="w-1/2 bg-indigo-100 rounded-lg p-3 shadow-sm">
            <div className="flex items-center mb-12">
              <div className="bg-blue-400 rounded-full p-2">
                <div className="flex items-center">
                  <img src="/api/placeholder/32/32" alt="Art icon" className="rounded-full" />
                </div>
              </div>
              <span className="ml-2 font-semibold">Art</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center">
                <span className="font-semibold">4</span>
                <User size={16} className="ml-1" />
              </div>
              <button className="bg-white rounded-lg px-3 py-1 font-medium">
                Rejoindre
              </button>
            </div>
          </div>
        </div>

        {/* Amis en jeu */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Amis en jeu</h2>
          <button className="text-red-400 font-medium">Inviter un amis</button>
        </div>
        <div className="flex space-x-6 mb-6">
          {/* Ami 1 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-1">
              <img src="/api/placeholder/48/48" alt="Ioulou avatar" className="rounded-full" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <span className="text-sm">Ioulou</span>
          </div>
          
          {/* Ami 2 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-1">
              <img src="/api/placeholder/48/48" alt="Narvallux avatar" className="rounded-full" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <span className="text-sm">Narvallux</span>
          </div>
          
          {/* Ami 3 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-1">
              <img src="/api/placeholder/48/48" alt="Nolan avatar" className="rounded-full" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <span className="text-sm">Nolan</span>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="mt-auto">
        <div className="flex justify-around items-center bg-black rounded-full mx-4 mb-4 py-3 px-6">
          <Home size={24} color="white" />
          <Trophy size={24} color="white" />
          <div className="bg-red-500 rounded-full p-2">
            <div className="transform rotate-45">
              <span className="text-white font-bold text-xl">+</span>
            </div>
          </div>
          <Search size={24} color="white" />
          <User size={24} color="white" />
        </div>
      </div>
    </div>
  );
};

export default BattleScreen;