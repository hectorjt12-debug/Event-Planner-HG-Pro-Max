
import React from 'react';
import { usePlannerStore } from '../store/usePlannerStore';

export default function Collaborators() {
  const peers = usePlannerStore((s) => s.peers);
  const currentUser = usePlannerStore((s) => s.currentUser);
  
  const allUsers = [currentUser, ...Object.values(peers)];

  return (
    <div className="flex items-center -space-x-2 mr-4">
      {allUsers.slice(0, 5).map((user) => (
        <div 
          key={user.id}
          className="relative group"
        >
          <div 
            className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center text-xs font-bold text-white shadow-lg cursor-help transition-transform hover:scale-110 hover:z-10"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.name.charAt(0)}
          </div>
          {/* Tooltip */}
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {user.name} {user.id === currentUser.id ? '(You)' : ''}
          </div>
        </div>
      ))}
      
      {allUsers.length > 5 && (
        <div className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] bg-gray-700 flex items-center justify-center text-[10px] text-white font-bold shadow-lg">
          +{allUsers.length - 5}
        </div>
      )}
      
      <div className="ml-3 flex items-center gap-2">
         <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
         <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Live</span>
      </div>
    </div>
  );
}
