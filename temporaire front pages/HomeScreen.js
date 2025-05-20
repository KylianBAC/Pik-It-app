import React from 'react';
import { X, Check, Home, Trophy, Search, User } from 'lucide-react';

const PikitHome = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header avec status bar */}
      <div className="p-4 bg-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-black">PIK<span className="mx-1">*</span>IT</h1>
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

        {/* Section Objet du Jour */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-black">OBJET DU JOUR</h2>
            <span className="text-xl font-medium">01:33:21</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col flex-grow mr-4">
              <div className="flex justify-between mb-2">
                <span>Défis réussis</span>
                <span>0/2</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full w-full">
                <div className="bg-red-500 h-2 rounded-full w-1/12"></div>
              </div>
            </div>
            <button className="bg-red-500 text-white py-2 px-6 rounded-lg font-medium">
              Commencer
            </button>
          </div>
        </div>

        {/* Section Enigme du Jour */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <h2 className="text-xl font-black mb-3">ENIGME DU JOUR</h2>
          <div className="bg-gray-200 rounded-lg p-3 mb-3">
            <div className="flex items-start mb-2">
              <div className="relative">
                <img src="/api/placeholder/60/60" alt="Enigme" className="rounded-lg" />
                <div className="absolute bottom-0 right-0 bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center">
                  <span className="font-bold text-sm">?</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="font-bold mb-1">L'énigme du jour</h3>
                <p className="text-sm">Je suis en terre mais je ne suis pas un arbre.</p>
                <p className="text-sm">Je tiens des plantes mais je n'ai pas de racines.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col flex-grow mr-4">
              <div className="flex justify-between mb-2">
                <span>Défis réussis</span>
                <span>1/2</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full w-full">
                <div className="bg-red-500 h-2 rounded-full w-1/2"></div>
              </div>
            </div>
            <button className="bg-red-500 text-white py-2 px-6 rounded-lg font-medium">
              Continuer
            </button>
          </div>
        </div>

        {/* Section Récompenses journalières */}
        <div className="bg-yellow-400 rounded-lg p-4 mb-4 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Récompenses journalières</h2>
            <button className="text-xl font-bold">
              <X size={20} />
            </button>
          </div>
          <div className="flex justify-between">
            {/* Jour 1 */}
            <div className="flex flex-col items-center">
              <div className="bg-yellow-300 rounded-lg w-14 h-14 flex items-center justify-center mb-1">
                <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-xs">100pt</span>
                </div>
                <div className="absolute bottom-11 bg-green-500 rounded-full p-1">
                  <Check size={12} color="white" />
                </div>
              </div>
              <span className="text-xs">Jour 1</span>
            </div>
            
            {/* Jour 2 */}
            <div className="flex flex-col items-center">
              <div className="bg-yellow-300 rounded-lg w-14 h-14 flex items-center justify-center mb-1">
                <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-xs">150pt</span>
                </div>
                <div className="absolute bottom-11 bg-green-500 rounded-full p-1">
                  <Check size={12} color="white" />
                </div>
              </div>
              <span className="text-xs">Jour 2</span>
            </div>
            
            {/* Jour 3 */}
            <div className="flex flex-col items-center">
              <div className="bg-yellow-300 rounded-lg w-14 h-14 flex items-center justify-center mb-1">
                <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-xs">200pt</span>
                </div>
                <div className="absolute bottom-11 bg-green-500 rounded-full p-1">
                  <Check size={12} color="white" />
                </div>
              </div>
              <span className="text-xs">Jour 3</span>
            </div>
            
            {/* Jour 4 (actif) */}
            <div className="flex flex-col items-center">
              <div className="bg-yellow-300 rounded-lg w-14 h-14 flex items-center justify-center mb-1 ring-2 ring-black">
                <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-xs font-bold">250pt</span>
                </div>
              </div>
              <span className="text-xs font-bold">Jour 4</span>
            </div>
            
            {/* Jour 5 */}
            <div className="flex flex-col items-center">
              <div className="bg-yellow-300 rounded-lg w-14 h-14 flex items-center justify-center mb-1">
                <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-xs">300pt</span>
                </div>
              </div>
              <span className="text-xs">Jour 5</span>
            </div>
            
            {/* Jour 6 */}
            <div className="flex flex-col items-center">
              <div className="bg-yellow-300 rounded-lg w-14 h-14 flex items-center justify-center mb-1">
                <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-xs">350pt</span>
                </div>
                <div className="absolute top
                -12 right-4 bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center">
                  <span className="text-white text-xs">C</span>
                </div>
              </div>
              <span className="text-xs">Jour 6</span>
            </div>
          </div>
        </div>

        {/* Section Publications */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex mb-4">
            <div className="flex-grow flex">
              <span className="font-bold text-lg">Publications</span>
            </div>
            <div className="flex rounded-full bg-gray-200 p-1">
              <button className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-medium">
                Amis
              </button>
              <button className="text-black px-4 py-1 rounded-full text-sm font-medium">
                Communauté
              </button>
            </div>
          </div>

          {/* Post d'un ami */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-3 flex items-center">
              <img src="/api/placeholder/36/36" alt="Profile" className="rounded-full" />
              <span className="ml-2 font-medium">@Ericlams</span>
            </div>
            <div className="h-40 bg-gray-300">
              <img src="/api/placeholder/400/160" alt="Post content" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="mt-auto">
        <div className="flex justify-around items-center bg-black rounded-full mx-4 mb-4 py-3 px-6">
          <Home size={24} color="#FF4B4B" />
          <Trophy size={24} color="white" />
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

export default PikitHome;