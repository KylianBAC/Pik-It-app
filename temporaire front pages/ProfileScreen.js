import React from 'react';
import { Home, Award, Search, User, Settings, Edit, BookOpen } from 'lucide-react';

const ProfilePage = () => {
  return (
    <div className="flex flex-col w-full h-screen bg-gray-100">
      {/* Header with profile banner */}
      <div className="relative">
        {/* Banner background with shapes */}
        <div className="h-32 rounded-b-3xl bg-pink-300 relative overflow-hidden">
          {/* Yellow square */}
          <div className="absolute -left-4 top-4 w-24 h-24 bg-yellow-300 rotate-12"></div>
          
          {/* Orange circles pattern */}
          <div className="absolute right-10 top-0">
            <div className="w-32 h-16 relative">
              {[1, 2, 3, 4, 5].map((size, i) => (
                <div key={i} className="absolute top-0 right-0 rounded-full border border-white" 
                     style={{
                       width: `${size * 6}px`, 
                       height: `${size * 6}px`,
                       borderRadius: '50%',
                       backgroundColor: 'rgb(234, 88, 12)',
                       borderWidth: '1px',
                       top: '5px',
                       right: '5px'
                     }}>
                </div>
              ))}
            </div>
          </div>
          
          {/* Settings gear */}
          <div className="absolute top-4 right-4 bg-gray-100 rounded-full p-2">
            <Settings size={20} />
          </div>
        </div>
        
        {/* Profile picture */}
        <div className="absolute -bottom-16 left-6 w-24 h-24 bg-gray-300 rounded-full border-4 border-white flex justify-center items-center">
          <User size={36} className="text-gray-500" />
          
          {/* Edit button */}
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-200">
            <Edit size={14} />
          </div>
        </div>
      </div>
      
      {/* Profile info */}
      <div className="mt-16 px-6">
        {/* Level indicator */}
        <div className="flex items-center mb-1">
          <span className="text-gray-800 font-medium">Niveau</span>
          <span className="text-gray-800 font-bold text-xl ml-1">14</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-24 h-2 bg-gray-200 rounded-full mb-2">
          <div className="h-full w-2/3 bg-red-400 rounded-full"></div>
        </div>
        
        {/* Name and crown */}
        <div className="flex items-center mb-2">
          <h1 className="text-2xl font-bold">Manola Boukac</h1>
          <span className="ml-2 text-xl">👑</span>
        </div>
        
        {/* Friends count */}
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium">45 Amis</span>
          
          {/* Friend button */}
          <button className="flex items-center bg-white rounded-full px-4 py-1 shadow-sm">
            <span className="text-red-400 font-medium">Amis</span>
            <span className="ml-1">👥</span>
          </button>
        </div>
        
        {/* Library button */}
        <button className="flex items-center bg-gray-200 rounded-full px-4 py-2 mb-4">
          <span className="font-medium">Ma bibliothèque</span>
          <BookOpen size={16} className="ml-2 text-red-400" />
        </button>
      </div>
      
      {/* Stats cards */}
      <div className="flex px-4 space-x-2 mb-6">
        {/* Streaks */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex-1 flex flex-col items-center">
          <span className="text-3xl font-bold mb-1">80</span>
          <div className="flex items-center">
            <span className="text-gray-600 text-sm">Meilleur Streaks</span>
            <span className="ml-1">🔥</span>
          </div>
          <span className="text-red-400 text-xl mt-1">→</span>
        </div>
        
        {/* Piks */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex-1 flex flex-col items-center">
          <span className="text-3xl font-bold mb-1">130</span>
          <span className="text-gray-600 text-sm">Piks</span>
        </div>
        
        {/* Titres */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex-1 flex flex-col items-center">
          <span className="text-3xl font-bold mb-1">21</span>
          <span className="text-gray-600 text-sm">Titres</span>
        </div>
      </div>
      
      {/* Global progression */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-gray-800 font-medium mb-4">Votre progression globale</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Images recognized */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Images reconnues</span>
              <span className="text-xl font-bold">190</span>
            </div>
            
            {/* Money collected */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Argent récolté</span>
              <span className="text-xl font-bold">9,90€</span>
            </div>
            
            {/* Picoins */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Picoins</span>
              <div className="flex items-center">
                <span className="text-xl font-bold mr-1">2 490</span>
                <span className="text-yellow-400">🪙</span>
              </div>
            </div>
            
            {/* Credits */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Crédits</span>
              <span className="text-xl font-bold">450</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Badges section */}
      <div className="px-4 mb-20">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <h2 className="text-gray-800 font-medium">Badges</h2>
            <span className="ml-2 text-red-500 font-medium">4</span>
            <span className="text-gray-500">/52</span>
          </div>
          <span className="text-red-500 font-medium">Voir tout</span>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-6 gap-2">
            {/* Active badges */}
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex justify-center">
                <div className="w-12 h-12">
                  <svg viewBox="0 0 50 50" className="w-full h-full">
                    <circle cx="25" cy="25" r="20" fill="white" stroke="black" strokeWidth="1" />
                    <path d="M25 10 L30 20 L40 22 L32 30 L34 40 L25 35 L16 40 L18 30 L10 22 L20 20 Z" fill="white" stroke="black" strokeWidth="1" />
                    <circle cx="25" cy="25" r="5" fill="black" />
                  </svg>
                </div>
              </div>
            ))}
            
            {/* Locked badges */}
            {[0, 1].map(i => (
              <div key={i} className="flex justify-center">
                <div className="w-12 h-12 opacity-30">
                  <svg viewBox="0 0 50 50" className="w-full h-full">
                    <circle cx="25" cy="25" r="20" fill="white" stroke="black" strokeWidth="1" />
                    <path d="M25 10 L30 20 L40 22 L32 30 L34 40 L25 35 L16 40 L18 30 L10 22 L20 20 Z" fill="white" stroke="black" strokeWidth="1" />
                    <circle cx="25" cy="25" r="8" fill="white" stroke="black" strokeWidth="1" />
                    <rect x="22" y="20" width="6" height="10" rx="2" fill="black" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center">
        <div className="bg-black rounded-full px-6 py-3 flex items-center justify-between w-4/5">
          <button className="text-white">
            <Home size={24} />
          </button>
          <button className="text-white">
            <Award size={24} />
          </button>
          <button className="bg-gray-700 p-2 rounded-full">
            <div className="text-xl">✖</div>
          </button>
          <button className="text-white">
            <Search size={24} />
          </button>
          <button className="bg-red-600 rounded-full p-2">
            <User size={24} className="text-white" />
          </button>
        </div>
      </div>
      
      {/* Date indicator (partially visible at bottom) */}
      <div className="fixed bottom-0 left-8 bg-yellow-100 rounded-t-lg px-2 py-1 text-xs text-gray-700">
        Dimanche
      </div>
      <div className="fixed bottom-0 right-8 bg-gray-200 rounded-t-lg px-2 py-1 text-xs text-gray-700">
        08/09
      </div>
    </div>
  );
};

export default ProfilePage;