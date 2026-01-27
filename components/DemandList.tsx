
import React from 'react';
import { Demand, ViewType } from '../types';
import { Plus, Check, Edit2, Trash2, RotateCcw, ClipboardList } from 'lucide-react';

interface DemandListProps {
  demands: Demand[];
  viewType: ViewType;
  onNewDemand: () => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onEdit: (demand: Demand) => void;
}

export const DemandList: React.FC<DemandListProps> = ({
  demands,
  viewType,
  onNewDemand,
  onDelete,
  onComplete,
  onEdit
}) => {
  return (
    <div className="max-w-6xl w-full mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-baseline gap-3">
          <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
            {viewType === 'active' ? 'Fluxo de Demandas' : 'Arquivo Concluído'}
          </h2>
          <div className="px-2 py-0.5 bg-teal-500/20 border border-teal-500/30 rounded-md backdrop-blur-md">
            <span className="text-teal-400 text-sm font-bold">{demands.length}</span>
          </div>
        </div>

        {viewType === 'active' && (
          <button
            onClick={onNewDemand}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#00f5d4] hover:bg-[#00d1b5] text-[#020f10] rounded-xl text-xs font-bold tracking-wider transition-all shadow-[0_4px_15px_rgba(0,245,212,0.4)] active:scale-95"
          >
            <Plus size={16} strokeWidth={3} />
            NOVA DEMANDA
          </button>
        )}
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden backdrop-blur-xl">
        {demands.length > 0 ? (
          <div className="overflow-x-auto">
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
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-gray-500 gap-4">
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
    if (demand.due_date < today) return 'text-red-500';
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
        <p className="text-gray-400 text-sm truncate" title={demand.description}>
          {demand.description || <span className="text-gray-700 italic">Sem descrição</span>}
        </p>
      </td>
      <td className="px-6 py-5 text-center">
        <span className={`text-[11px] font-mono tracking-tighter ${textColorClass} opacity-80`}>{dateFormatted}</span>
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
