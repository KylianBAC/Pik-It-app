import React from 'react';
import { Home, Trophy, Search, User } from 'lucide-react';

const BonsPlansPage = () => {
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
          <button className="text-white rounded-full py-2 px-4 font-medium flex items-center flex-1 justify-center">
            <span>Défis</span>
            <Trophy size={16} className="ml-1" />
          </button>
          <button className="text-white rounded-full py-2 px-4 font-medium flex items-center flex-1 justify-center">
            <span>Cadeaux</span>
            <span className="ml-1">🎁</span>
          </button>
          <button className="bg-white text-black rounded-full py-2 px-4 font-medium flex items-center flex-1 justify-center">
            <span>Bons plans</span>
            <span className="ml-1">💸</span>
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 p-4 space-y-5 overflow-auto">
        {/* Section "Les plus utilisés" */}
        <div>
          <h2 className="text-lg font-bold mb-3">Les plus utilisés</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Hello Fresh */}
            <div className="bg-yellow-200 rounded-lg p-3 relative overflow-hidden">
              <div className="bg-yellow-300 absolute -right-5 -top-5 rotate-12 w-16 h-16"></div>
              <div className="relative z-10">
                <div className="bg-black bg-opacity-75 inline-block px-2 py-1 rounded mb-1">
                  <p className="text-white font-bold text-xs">2 MOIS</p>
                  <p className="text-white font-bold text-xs">d'abonnement</p>
                </div>
                <div className="flex justify-between mb-2">
                  <div className="bg-black rounded-lg p-1">
                    <p className="text-white font-bold text-xs">HELLO</p>
                    <p className="text-white font-bold text-xs">FRESH</p>
                  </div>
                  <div className="text-yellow-600 font-bold">
                    1 000 <span className="text-yellow-500">C</span>
                  </div>
                </div>
                <img src="/api/placeholder/100/60" alt="Hello Fresh" className="rounded w-full object-cover" />
              </div>
            </div>

            {/* Allyup */}
            <div className="bg-blue-200 rounded-lg p-3 relative overflow-hidden">
              <div className="bg-blue-300 absolute -right-5 -top-5 rotate-12 w-16 h-16"></div>
              <div className="relative z-10">
                <div className="bg-green-500 inline-block px-2 py-1 rounded mb-1">
                  <p className="text-white font-bold text-xs">-20%</p>
                  <p className="text-white font-bold text-xs">sur ta commande</p>
                </div>
                <div className="flex justify-between mb-2">
                  <div className="text-gray-800 font-bold text-lg">
                    all<span className="text-blue-600">up</span>
                  </div>
                  <div className="text-blue-600 font-bold">
                    500 <span className="text-yellow-500">C</span>
                  </div>
                </div>
                <img src="/api/placeholder/100/60" alt="Allyup" className="rounded w-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Section "Ta graille" */}
        <div>
          <h2 className="text-lg font-bold mb-3">Ta graille 🍔</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Deliveroo */}
            <div className="bg-pink-200 rounded-lg p-3 relative overflow-hidden">
              <div className="bg-pink-300 absolute -right-5 -top-5 rotate-12 w-16 h-16"></div>
              <div className="relative z-10">
                <div className="bg-blue-900 inline-block px-2 py-1 rounded mb-1">
                  <p className="text-white font-bold text-xs">-20%</p>
                  <p className="text-white font-bold text-xs">sur ta commande</p>
                </div>
                <div className="flex justify-between mb-2">
                  <div className="text-blue-900 font-bold">
                    Deliveroo
                  </div>
                  <div className="text-pink-600 font-bold">
                    5 000 <span className="text-yellow-500">C</span>
                  </div>
                </div>
                <img src="/api/placeholder/100/60" alt="Deliveroo" className="rounded w-full object-cover" />
              </div>
            </div>

            {/* Uber Eats */}
            <div className="bg-green-200 rounded-lg p-3 relative overflow-hidden">
              <div className="bg-green-300 absolute -right-5 -top-5 rotate-12 w-16 h-16"></div>
              <div className="relative z-10">
                <div className="bg-black bg-opacity-75 inline-block px-2 py-1 rounded mb-1">
                  <p className="text-white font-bold text-xs">2 MOIS</p>
                  <p className="text-white font-bold text-xs">d'abonnement</p>
                </div>
                <div className="flex justify-between mb-2">
                  <div className="text-gray-800 font-bold text-lg">
                    Uber Eats
                  </div>
                  <div className="text-green-600 font-bold">
                    10 000 <span className="text-yellow-500">C</span>
                  </div>
                </div>
                <img src="/api/placeholder/100/60" alt="Uber Eats" className="rounded w-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Section "Cadeaux éphémères" */}
        <div>
          <h2 className="text-lg font-bold mb-2">Cadeaux éphémères 🎁</h2>
          {/* PIK-IT offer */}
          <div className="bg-blue-200 rounded-lg p-4 relative">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="text-yellow-400 font-black text-5xl">2</span>
                <span className="text-yellow-400 font-black text-3xl mx-1">000</span>
                <div className="bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center border-4 border-yellow-500">
                  <span className="text-yellow-800 text-xs">C</span>
                </div>
              </div>
              <div className="text-gray-800 font-black text-2xl">PIK-IT</div>
            </div>
            <div className="flex items-center mb-2">
              <span className="text-gray-800 font-bold mr-1">à seulement</span>
              <span className="text-yellow-600 font-bold">4,99€</span>
            </div>
            <p className="text-gray-700 text-sm mb-3">
              Relève les défis et augmente tes chances de trouver une alternance
            </p>
            <div className="bg-gray-400 rounded-full h-6 mb-3 flex items-center px-2">
              <span className="text-white font-bold">0/3</span>
            </div>
            <button className="bg-red-500 text-white py-2 px-6 rounded-full font-medium w-full">
              Acheter maintenant
            </button>
          </div>
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

export default BonsPlansPage;