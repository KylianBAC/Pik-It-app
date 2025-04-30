import React from 'react';
import { Search, MessageSquare, Heart, Share2, Home, Award, User } from 'lucide-react';

const ExplorerApp = () => {
  return (
    <div className="flex flex-col w-full h-screen bg-gray-100">
      {/* Status Bar */}
      <div className="flex justify-between items-center p-2 bg-gray-100">
        <div className="text-sm font-bold">4:20</div>
        <div className="flex items-center space-x-1">
          <div className="font-bold">•••</div>
          <div className="font-bold">📶</div>
          <div className="font-bold">🔋</div>
        </div>
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2">
        <div className="text-xl font-extrabold tracking-wider">EXPLORER</div>
        <div className="flex items-center space-x-2">
          <div className="bg-white rounded-full px-3 py-1 text-sm font-semibold flex items-center">
            <span>150 pts</span>
          </div>
          <div className="bg-white rounded-full px-2 py-1 text-sm font-semibold flex items-center">
            <span>1280</span>
            <span className="text-yellow-400 ml-1">🪙</span>
          </div>
        </div>
      </div>
      
      {/* Title */}
      <div className="px-4 py-2">
        <h1 className="text-2xl font-bold">Explorer</h1>
      </div>
      
      {/* Search Bar */}
      <div className="px-4 py-2">
        <div className="flex items-center bg-gray-200 rounded-full px-4 py-2">
          <div className="flex-grow text-gray-500 text-sm">
            Rechercher une publication, ou un ami
          </div>
          <Search className="text-gray-500 ml-2" size={20} />
          <div className="ml-2 text-red-400">
            <div className="flex flex-col">
              <div className="h-1 w-4 bg-red-400 mb-1 rounded-full"></div>
              <div className="h-1 w-4 bg-red-400 mb-1 rounded-full"></div>
              <div className="h-1 w-4 bg-red-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter Tags */}
      <div className="flex px-4 py-2 space-x-2">
        <div className="flex items-center bg-red-100 rounded-full px-3 py-1">
          <span className="text-sm">Nature</span>
          <span className="ml-1 font-bold">×</span>
        </div>
        <div className="flex items-center bg-red-100 rounded-full px-3 py-1">
          <span className="text-sm">Art</span>
          <span className="ml-1 font-bold">×</span>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex border-b">
          <div className="px-4 pb-2">Publications</div>
          <div className="px-4 pb-2 bg-yellow-400 rounded-t-lg font-medium">Amis</div>
          <div className="px-4 pb-2">Communauté</div>
        </div>
      </div>
      
      {/* Posts */}
      <div className="flex-grow px-4 py-2 overflow-auto">
        {/* Post 1 */}
        <div className="bg-white rounded-xl shadow-lg mb-4 overflow-hidden">
          {/* Post Header */}
          <div className="p-3 flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-300 overflow-hidden">
              <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <span className="ml-2 font-medium">@Ericlams</span>
          </div>
          
          {/* Post Content */}
          <div className="relative">
            <img src="/api/placeholder/400/200" alt="Plant post" className="w-full h-48 object-cover" />
            
            {/* Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <div className="flex items-center">
                <div className="text-2xl font-bold">Pot de fleur</div>
                <div className="ml-2">🙂</div>
              </div>
              <div className="flex items-center text-sm opacity-75">
                <div>via les vilains</div>
                <div className="ml-auto">il y a 10min</div>
              </div>
            </div>
            
            {/* Avatar in corner */}
            <div className="absolute bottom-3 right-3 w-12 h-12 bg-blue-500 rounded-lg overflow-hidden border-2 border-white">
              <img src="/api/placeholder/48/48" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
          
          {/* Post Actions */}
          <div className="flex p-2">
            <button className="flex items-center justify-center bg-gray-200 rounded-full px-3 py-1 mr-2">
              <MessageSquare size={16} className="mr-1" />
              <span className="text-sm">Commenter</span>
            </button>
            <button className="flex items-center justify-center bg-gray-200 rounded-full px-3 py-1 mr-2">
              <Heart size={16} className="mr-1" />
              <span className="text-sm">123</span>
            </button>
            <button className="flex items-center justify-center bg-gray-200 rounded-full px-3 py-1">
              <Share2 size={16} />
            </button>
          </div>
          
          {/* Comments */}
          <div className="px-3 py-2 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-600">2 Commentaires</span>
            <div className="transform rotate-180">▲</div>
          </div>
        </div>
        
        {/* Post 2 (partial) */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Post Header */}
          <div className="p-3 flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-300 overflow-hidden">
              <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <span className="ml-2 font-medium">@Ericlams</span>
          </div>
          
          {/* Post Content (partial) */}
          <div className="relative">
            <img src="/api/placeholder/400/100" alt="Nature post" className="w-full h-24 object-cover" />
            
            {/* Avatar in corner */}
            <div className="absolute bottom-3 right-3 w-12 h-12 bg-blue-500 rounded-lg overflow-hidden border-2 border-white">
              <img src="/api/placeholder/48/48" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="bg-black rounded-full mx-auto mb-4 px-6 py-3 flex items-center justify-between w-4/5">
        <button className="text-white">
          <Home size={24} />
        </button>
        <button className="text-white">
          <Award size={24} />
        </button>
        <button className="bg-gray-700 p-2 rounded-full">
          <div className="text-xl">✖</div>
        </button>
        <button className="text-red-500">
          <Search size={24} />
        </button>
        <button className="text-white">
          <User size={24} />
        </button>
      </div>
    </div>
  );
};

export default ExplorerApp;