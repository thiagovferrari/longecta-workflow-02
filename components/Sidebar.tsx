
import React from 'react';
import { ClipboardList, CheckCircle2, LogOut, Image as ImageIcon } from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  activeTab: ViewType;
  onTabChange: (tab: ViewType) => void;
  user: any;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, user, onLogout }) => {
  return (
    <aside className="w-20 bg-black/40 border-r border-white/10 flex flex-col items-center py-8 gap-10 backdrop-blur-xl z-20">
      <div className="w-10 h-10 bg-teal-500/20 border border-teal-500/40 rounded-xl flex items-center justify-center text-[#00f5d4] font-bold text-xs shadow-[0_0_15px_rgba(0,245,212,0.2)]">
        LON
      </div>

      <nav className="flex flex-col gap-6">
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
          title="Arquivo Concluído"
        />
        <div className="w-8 h-px bg-white/10 mx-auto my-2" />
        <SidebarIcon
          icon={<ImageIcon size={22} />}
          active={activeTab === 'projects'}
          onClick={() => onTabChange('projects')}
          title="Projetos da Equipe"
        />
      </nav>

      <div className="mt-auto flex flex-col gap-6 items-center">
        <button
          onClick={onLogout}
          title="Sair do Sistema"
          className="p-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 group"
        >
          <LogOut size={20} />
        </button>
        <div
          title={user?.email}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 border border-white/20 shadow-lg flex items-center justify-center font-bold text-white text-xs cursor-pointer hover:scale-105 transition-transform"
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
    className={`p-3 rounded-xl transition-all duration-300 relative group ${active
      ? 'bg-teal-500/20 text-[#00f5d4] shadow-[0_0_20px_rgba(0,245,212,0.15)] border border-teal-500/30'
      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
      }`}
  >
    {icon}
    <span className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity border border-white/10 uppercase tracking-widest font-bold">
      {title}
    </span>
  </button>
);
