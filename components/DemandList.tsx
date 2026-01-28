import React from 'react';
import { Demand, ViewType } from '../types';
import { Plus, Check, Edit2, Trash2, RotateCcw, ClipboardList, Search } from 'lucide-react';

interface DemandListProps {
  demands: Demand[];
  viewType: ViewType;
  onNewDemand: () => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onEdit: (demand: Demand) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export const DemandList: React.FC<DemandListProps> = ({
  demands,
  viewType,
  onNewDemand,
  onDelete,
  onComplete,
  onEdit,
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="max-w-6xl w-full mx-auto">
      <div className="flex items-center justify-between mb-8 px-4 md:px-0">
        <div className="flex items-center gap-6">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-md">
              {viewType === 'active' ? 'Fluxo de Demandas' : 'Arquivo Concluído'}
            </h2>
            <div className="px-2 py-0.5 bg-teal-500/20 border border-teal-500/30 rounded-md backdrop-blur-md">
              <span className="text-teal-400 text-sm font-bold">{demands.length}</span>
            </div>
          </div>

          {onSearchChange && (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search size={14} className="text-gray-500 group-focus-within:text-teal-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Filtrar..."
                value={searchTerm || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-8 pr-4 text-xs text-white focus:outline-none focus:bg-white/10 focus:border-teal-500/30 transition-all w-32 focus:w-48 placeholder:text-gray-600 shadow-inner"
              />
            </div>
          )}
        </div>

        {viewType === 'active' && (
          <button
            onClick={onNewDemand}
            className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-2.5 bg-[#00f5d4] hover:bg-[#00d1b5] text-[#020f10] rounded-xl text-[10px] md:text-xs font-bold tracking-wider transition-all shadow-[0_4px_15px_rgba(0,245,212,0.4)] active:scale-95 whitespace-nowrap"
          >
            <Plus size={16} strokeWidth={3} />
            <span className="hidden md:inline">NOVA DEMANDA</span>
            <span className="md:hidden">NOVA</span>
          </button>
        )}
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden backdrop-blur-xl border border-white/5 md:border-white/10 mx-4 md:mx-0">
        {demands.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead className="bg-white/5 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] border-b border-white/5">
                  <tr>
                    <th className="px-8 py-6 w-[25%]">Título da Demanda</th>
                    <th className="px-6 py-6 w-[40%]">Detalhes / Conteúdo</th>
                    <th className="px-6 py-6 w-[15%] text-center">Data Limite</th>
                    <th className="px-6 py-6 w-[20%] text-right">Controle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {demands.map((demand) => (
                    <DemandRow
                      key={demand.id}
                      demand={demand}
                      viewType={viewType}
                      onDelete={() => onDelete(demand.id)}
                      onComplete={() => onComplete(demand.id)}
                      onEdit={() => onEdit(demand)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col divide-y divide-white/5">
              {demands.map((demand) => (
                <MobileDemandCard
                  key={demand.id}
                  demand={demand}
                  viewType={viewType}
                  onDelete={() => onDelete(demand.id)}
                  onComplete={() => onComplete(demand.id)}
                  onEdit={() => onEdit(demand)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="py-16 md:py-24 flex flex-col items-center justify-center text-gray-500 gap-4">
            <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center shadow-inner">
              <ClipboardList size={24} className="opacity-50" />
            </div>
            <p className="text-sm font-medium tracking-wide opacity-50">NADA POR AQUI</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DemandRow: React.FC<{
  demand: Demand;
  viewType: ViewType;
  onDelete: () => void;
  onComplete: () => void;
  onEdit: () => void;
}> = ({ demand, viewType, onDelete, onComplete, onEdit }) => {

  const getUrgencyColor = () => {
    if (demand.state === 'completed') return 'text-teal-400';

    const today = new Date().toLocaleDateString('en-CA');
    if (demand.due_date === today) return 'text-[#00f5d4]';
    if (demand.due_date < today) return 'text-orange-500';
    return 'text-white';
  };

  const textColorClass = getUrgencyColor();
  const dateFormatted = new Date(demand.due_date + 'T12:00:00').toLocaleDateString('pt-BR');

  return (
    <tr className="hover:bg-white/[0.05] transition-colors group">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full bg-current ${textColorClass}`} />
          <span className={`font-bold text-base truncate ${textColorClass}`}>
            {demand.title}
          </span>
        </div>
      </td>
      <td className="px-6 py-5">
        <p className={`text-base truncate ${textColorClass}`} title={demand.description}>
          {demand.description || <span className="text-gray-700 italic">Sem descrição</span>}
        </p>
      </td>
      <td className="px-6 py-5 text-center">
        <span className={`text-base font-mono tracking-tighter ${textColorClass}`}>{dateFormatted}</span>
      </td>
      <td className="px-6 py-5 text-right">
        <div className="flex justify-end gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {viewType === 'active' ? (
            <>
              <ActionButton icon={<Check size={14} />} color="text-[#00f5d4] border-[#00f5d4]/20" onClick={onComplete} title="Concluir" />
              <ActionButton icon={<Edit2 size={14} />} color="text-blue-400 border-blue-400/20" onClick={onEdit} title="Editar" />
              <ActionButton icon={<Trash2 size={14} />} color="text-red-500 border-red-500/20" onClick={onDelete} title="Remover" />
            </>
          ) : (
            <>
              <ActionButton icon={<RotateCcw size={14} />} color="text-teal-400 border-teal-400/20" onClick={onComplete} title="Restaurar" />
              <ActionButton icon={<Trash2 size={14} />} color="text-red-500 border-red-500/20" onClick={onDelete} title="Excluir Definitivamente" />
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

const MobileDemandCard: React.FC<{
  demand: Demand;
  viewType: ViewType;
  onDelete: () => void;
  onComplete: () => void;
  onEdit: () => void;
}> = ({ demand, viewType, onDelete, onComplete, onEdit }) => {
  const dateFormatted = new Date(demand.due_date + 'T12:00:00').toLocaleDateString('pt-BR');

  const getUrgencyColor = () => {
    if (demand.state === 'completed') return 'text-teal-400';
    const today = new Date().toLocaleDateString('en-CA');
    if (demand.due_date === today) return 'text-[#00f5d4]';
    if (demand.due_date < today) return 'text-orange-500';
    return 'text-white';
  };

  const statusColor = getUrgencyColor();

  return (
    <div className="p-5 flex flex-col gap-3 active:bg-white/5 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`w-2 h-2 shrink-0 rounded-full bg-current ${statusColor}`} />
          <h3 className={`font-bold text-base truncate ${statusColor}`}>{demand.title}</h3>
        </div>
        <span className="text-[10px] font-mono tracking-tighter opacity-60 shrink-0 pt-1">{dateFormatted}</span>
      </div>

      <p className="text-sm text-gray-400 line-clamp-2 pl-5">
        {demand.description || <span className="italic opacity-50">Sem descrição</span>}
      </p>

      <div className="flex items-center justify-end gap-3 mt-2 pl-5">
        {viewType === 'active' ? (
          <>
            <button onClick={(e) => { e.stopPropagation(); onComplete(); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00f5d4]/10 text-[#00f5d4] border border-[#00f5d4]/20 text-[10px] font-bold uppercase tracking-wider">
              <Check size={12} strokeWidth={3} /> Concluir
            </button>
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Edit2 size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
              <Trash2 size={14} />
            </button>
          </>
        ) : (
          <>
            <button onClick={(e) => { e.stopPropagation(); onComplete(); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold uppercase tracking-wider">
              <RotateCcw size={12} strokeWidth={3} /> Restaurar
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const ActionButton: React.FC<{ icon: React.ReactNode, color: string, onClick: () => void, title: string }> = ({ icon, color, onClick, title }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    title={title}
    className={`p-2 rounded-lg bg-black/60 border ${color.split(' ')[1]} ${color.split(' ')[0]} hover:bg-white/[0.1] transition-all transform active:scale-90 shadow-lg`}
  >
    {icon}
  </button>
);
