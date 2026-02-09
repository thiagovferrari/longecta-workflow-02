
import React from 'react';
import { ClipboardList, CheckCircle2, LogOut, Image as ImageIcon, Instagram } from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  activeTab: ViewType;
  onTabChange: (tab: ViewType) => void;
  user: any;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, user, onLogout }) => {
  return (
    <aside className="w-24 border-r border-white/5 flex flex-col items-center py-8 gap-10 z-20 glass-panel h-full">
      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-[0_0_20px_rgba(0,245,212,0.1)] backdrop-blur-md">
        LON
      </div>

      <nav className="flex flex-col gap-8 w-full px-4">
        <SidebarIcon
          icon={<ClipboardList size={22} />}
          active={activeTab === 'active'}
          onClick={() => onTabChange('active')}
          title="Demandas Ativas"
        />

        <SidebarIcon
          icon={<CheckCircle2 size={22} />}
          active={activeTab === 'completed'}
          onClick={() => onTabChange('completed')}
          title="Concluídas"
        />

        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

        <SidebarIcon
          icon={<ImageIcon size={22} />}
          active={activeTab === 'projects'}
          onClick={() => onTabChange('projects')}
          title="Projetos"
        />

        <a
          href="https://monitor-git-main-thiagos-projects-62baec48.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          title="Instagram"
          className="p-3.5 rounded-2xl transition-all duration-500 relative group w-full flex justify-center text-white bg-gradient-to-tr from-[#fdf497] via-[#f56040] to-[#833ab4] border border-white/20 shadow-[0_0_20px_rgba(253,244,151,0.2)] hover:scale-110 active:scale-95"
        >
          <Instagram size={22} />
          <span className="absolute left-full ml-4 px-3 py-1.5 bg-black/80 backdrop-blur-xl text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all border border-white/10 uppercase tracking-widest font-bold translate-x-[-10px] group-hover:translate-x-0 shadow-xl">
            Instagram
          </span>
        </a>
      </nav>

      <div className="mt-auto flex flex-col gap-6 items-center w-full px-4">
        <button
          onClick={onLogout}
          title="Sair do Sistema"
          className="p-3 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10 group w-full flex justify-center"
        >
          <LogOut size={20} />
        </button>
        <div
          title={user?.email}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-2 border-white/20 shadow-lg flex items-center justify-center font-bold text-white text-xs cursor-pointer hover:scale-110 transition-transform"
        >
          {user?.email?.[0].toUpperCase()}
        </div>
      </div>
    </aside>
  );
};

interface SidebarIconProps {
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  title?: string;
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ icon, active, onClick, title }) => (
  <button
    onClick={onClick}
    className={`p-3.5 rounded-2xl transition-all duration-500 relative group w-full flex justify-center ${active
      ? 'bg-white/10 text-white shadow-[0_0_30px_rgba(255,255,255,0.15)] border border-white/20'
      : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
      }`}
  >
    {icon}
    {active && (
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
    )}
    <span className="absolute left-full ml-4 px-3 py-1.5 bg-black/80 backdrop-blur-xl text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all border border-white/10 uppercase tracking-widest font-bold translate-x-[-10px] group-hover:translate-x-0 shadow-xl">
      {title}
    </span>
  </button>
);
