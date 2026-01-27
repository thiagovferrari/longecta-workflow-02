
import React from 'react';
import { PresenceUser } from '../types';

interface HeaderProps {
  onlineUsers: PresenceUser[];
}

export const Header: React.FC<HeaderProps> = ({ onlineUsers }) => {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 backdrop-blur-md bg-black/20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          L
        </div>
        <h1 className="text-xl font-light">
          <span className="font-bold text-white">Longecta</span> <span className="text-gray-500">2026</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex -space-x-2 overflow-hidden">
          {onlineUsers.slice(0, 5).map((user) => (
            <div 
              key={user.user_id}
              title={user.email}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-[#020f10] bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-[10px] font-bold text-teal-400"
            >
              {user.email[0].toUpperCase()}
            </div>
          ))}
          {onlineUsers.length > 5 && (
            <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-[#020f10] bg-gray-800 text-[10px] font-bold text-gray-400">
              +{onlineUsers.length - 5}
            </div>
          )}
        </div>
        <div className="text-[10px] tracking-[0.2em] text-teal-500/70 uppercase font-bold flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse shadow-[0_0_8px_#14b8a6]" />
          WORKSPACE LIVE
        </div>
      </div>
    </header>
  );
};
