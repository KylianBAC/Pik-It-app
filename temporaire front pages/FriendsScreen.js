import React from 'react';
import { ChevronLeft, Search } from 'lucide-react';

const FriendsPage = () => {
  return (
    <div className="flex flex-col w-full h-screen bg-gray-100">
      {/* Header */}
      <div className="flex items-center p-4 pt-8">
        <div className="bg-white rounded-full p-2 shadow-sm">
          <ChevronLeft size={24} />
        </div>
        <h1 className="ml-6 text-2xl font-black tracking-wider">AMIS</h1>
      </div>
      
      {/* Add Friends Section */}
      <div className="px-4 pt-6">
        <h2 className="text-lg font-bold mb-3">Ajouter des amis</h2>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <input 
            type="text" 
            placeholder="Rechercher un utilisateur" 
            className="w-full bg-gray-200 rounded-lg p-3 pl-4 pr-12"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Search size={22} className="text-gray-500" />
          </div>
        </div>
      </div>
      
      {/* Online Friends Section */}
      <div className="px-4 mb-4">
        <div className="flex items-center mb-3">
          <h2 className="text-lg font-bold">Amis en ligne</h2>
          <span className="ml-2 text-gray-500">(2)</span>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          {/* Friend 1 */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-yellow-500">
                <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <span className="ml-3 font-medium">@ericlams</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">En ligne</span>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
          
          {/* Friend 2 */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-red-500 to-orange-500">
                <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <span className="ml-3 font-medium">@malofaisse</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">En ligne</span>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* All Friends Section */}
      <div className="px-4">
        <div className="flex items-center mb-3">
          <h2 className="text-lg font-bold">Mes amis</h2>
          <span className="ml-2 text-gray-500">(6)</span>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Friend 1 */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-yellow-500">
                <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <span className="ml-3 font-medium">@ericlams</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">En ligne</span>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
          
          {/* Friend 2 */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-red-500 to-orange-500">
                <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <span className="ml-3 font-medium">@malofaisse</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">En ligne</span>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
          
          {/* Friend 3 */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-pink-300">
                <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <span className="ml-3 font-medium">@Louiseattak</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Hors ligne</span>
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            </div>
          </div>
          
          {/* Friend 4 */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-500">
                <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <span className="ml-3 font-medium">@Simtaar</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Hors ligne</span>
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            </div>
          </div>
          
          {/* Friend 5 */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-teal-500">
                <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <span className="ml-3 font-medium">@Pichon</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Hors ligne</span>
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            </div>
          </div>
          
          {/* Friend 6 */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-rose-200">
                <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <span className="ml-3 font-medium">@Xx-monsterdu29</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Hors ligne</span>
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;