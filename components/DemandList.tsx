import React, { useState, useEffect, useRef } from 'react';
import { Demand, ViewType } from '../types';
import { Check, Edit2, Trash2, RotateCcw, ClipboardList, Search, Calendar, Save, X, Plus } from 'lucide-react';

interface DemandListProps {
  demands: Demand[];
  viewType: ViewType;
  onNewDemand: () => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onEdit: (demand: Demand) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  editingDemand?: Demand | null;
  onSave?: (data: { title: string; description: string; due_date: string }) => Promise<void>;
  onCancelEdit?: () => void;
  defaultDate?: string;
}

export const DemandList: React.FC<DemandListProps> = ({
  demands,
  viewType,
  onNewDemand,
  onDelete,
  onComplete,
  onEdit,
  searchTerm,
  onSearchChange,
  editingDemand,
  onSave,
  onCancelEdit,
  defaultDate
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: defaultDate || new Date().toISOString().split('T')[0]
  });

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const resetHeights = () => {
    if (titleRef.current) titleRef.current.style.height = '36px';
    if (descRef.current) descRef.current.style.height = '36px';
  };

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  useEffect(() => {
    if (editingDemand) {
      setFormData({
        title: editingDemand.title,
        description: editingDemand.description || '',
        due_date: editingDemand.due_date
      });
      // Aguarda o React renderizar o texto, depois redimensiona
      setTimeout(() => {
        if (titleRef.current) {
          titleRef.current.style.height = 'auto';
          titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
        }
        if (descRef.current) {
          descRef.current.style.height = 'auto';
          descRef.current.style.height = descRef.current.scrollHeight + 'px';
          // Coloca cursor no final
          const length = descRef.current.value.length;
          descRef.current.setSelectionRange(length, length);
          descRef.current.focus();
        }
      }, 0);
    } else {
      setFormData(prev => ({
        ...prev,
        title: '',
        description: '',
        due_date: defaultDate || prev.due_date
      }));
      resetHeights();
    }
  }, [editingDemand, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !onSave) return;

    await onSave(formData);

    if (!editingDemand) {
      setFormData(prev => ({ ...prev, title: '', description: '' }));
      resetHeights();
      titleRef.current?.focus();
    }
  };

  const handleCancel = () => {
    if (onCancelEdit) onCancelEdit();
    resetHeights();
  };

  const openDatePicker = () => {
    if (dateInputRef.current) {
      if ('showPicker' in dateInputRef.current) {
        (dateInputRef.current as any).showPicker();
      } else {
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };

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
      </div>

      {viewType === 'active' && onSave && (
        <form
          onSubmit={handleSubmit}
          className={`mb-10 mx-4 md:mx-0 p-3 md:p-4 rounded-2xl border transition-all duration-300 relative shadow-xl overflow-hidden
            ${editingDemand
              ? 'bg-[#0a101f]/90 border-blue-500/40 shadow-[0_0_40px_rgba(59,130,246,0.15)]'
              : 'bg-[#020f10]/60 glass-panel border-white/5 hover:border-teal-500/20'
            }`}
        >
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${editingDemand ? 'bg-blue-500' : 'bg-[#00f5d4]'}`} />

          <div className="flex flex-col md:flex-row items-center gap-3 pl-3 md:pl-4">
            <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${editingDemand ? 'bg-blue-500/10 text-blue-400 border border-blue-500/10' : 'bg-teal-500/10 text-[#00f5d4] border border-teal-500/10'}`}>
              {editingDemand ? <Edit2 size={18} /> : <Plus size={18} strokeWidth={3} />}
            </div>

            <div className="flex-1 w-full flex flex-col md:flex-row gap-3 items-center">
              <textarea
                ref={titleRef}
                value={formData.title}
                onChange={e => {
                  setFormData({ ...formData, title: e.target.value });
                  autoResize(e.target);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    descRef.current?.focus();
                  }
                }}
                rows={1}
                placeholder={editingDemand ? "Editando título..." : "O que precisa ser feito?"}
                className="w-full md:w-auto md:flex-[0_0_280px] bg-transparent border-none text-base text-white placeholder:text-gray-600 focus:outline-none resize-none overflow-hidden leading-tight font-medium min-h-[36px] py-2 px-3 rounded-lg transition-colors placeholder:font-normal"
              />

              <textarea
                ref={descRef}
                value={formData.description}
                onChange={e => {
                  setFormData({ ...formData, description: e.target.value });
                  autoResize(e.target);
                }}
                rows={1}
                placeholder="Adicionar detalhes, contexto ou observações..."
                className="flex-1 w-full bg-transparent border border-transparent focus:border-white/5 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none resize-none overflow-hidden leading-relaxed min-h-[36px] py-2 px-3 rounded-lg hover:bg-white/5 focus:bg-white/5 transition-all"
              />

              <div
                className="relative group min-w-[140px] shrink-0"
                onClick={openDatePicker}
              >
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 group-hover:border-white/20 transition-all cursor-pointer">
                  <Calendar size={16} className={`text-gray-500 group-hover:text-white transition-colors ${editingDemand ? 'text-blue-400' : 'text-teal-400'}`} />
                  <span className="text-xs font-medium text-gray-300 group-hover:text-white select-none">
                    {formData.due_date ? new Date(formData.due_date + 'T12:00:00').toLocaleDateString('pt-BR') : 'Sem data'}
                  </span>
                </div>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={formData.due_date}
                  onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 pointer-events-none"
                  tabIndex={-1}
                  title="Escolher data de entrega"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`h-10 w-10 md:h-11 md:w-11 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95 shrink-0
                ${editingDemand
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30'
                  : 'bg-[#00f5d4] hover:bg-[#00e0c2] text-[#020f10] shadow-teal-500/30'
                }`}
              title={editingDemand ? "Salvar Alterações" : "Cadastrar Demanda"}
            >
              {editingDemand ? <Save size={18} /> : <Plus size={20} strokeWidth={3} />}
            </button>

            {editingDemand && (
              <button
                type="button"
                onClick={handleCancel}
                className="h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all border border-transparent hover:border-red-500/30 shrink-0"
                title="Cancelar Edição"
              >
                <X size={18} />
              </button>
            )}

          </div>
        </form>
      )}

      <div className="glass-panel rounded-3xl overflow-hidden backdrop-blur-xl border border-white/5 md:border-white/10 mx-4 md:mx-0">
        {demands.length > 0 ? (
          <>
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
    <tr className="hover:bg-white/[0.05] transition-colors group relative">
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
      <td className="px-6 py-5 text-right relative z-10">
        <div className="flex justify-end gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {viewType === 'active' ? (
            <>
              <ActionButton
                icon={<Check size={14} />}
                className="bg-black/60 border border-[#00f5d4]/20 text-[#00f5d4] hover:bg-[#00f5d4]/10 hover:border-[#00f5d4]/50"
                onClick={onComplete}
                title="Concluir"
              />
              <ActionButton
                icon={<Edit2 size={14} />}
                className="bg-black/60 border border-blue-400/20 text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/50"
                onClick={onEdit}
                title="Editar"
              />
              <ActionButton
                icon={<Trash2 size={14} />}
                className="bg-black/60 border border-red-500/20 text-red-500 hover:bg-red-500/10 hover:border-red-500/50"
                onClick={onDelete}
                title="Remover"
              />
            </>
          ) : (
            <>
              <ActionButton
                icon={<RotateCcw size={14} />}
                className="bg-black/60 border border-teal-400/20 text-teal-400 hover:bg-teal-400/10 hover:border-teal-400/50"
                onClick={onComplete}
                title="Restaurar"
              />
              <ActionButton
                icon={<Trash2 size={14} />}
                className="bg-black/60 border border-red-500/20 text-red-500 hover:bg-red-500/10 hover:border-red-500/50"
                onClick={onDelete}
                title="Excluir Definitivamente"
              />
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
    <div className="p-5 flex flex-col gap-3 active:bg-white/5 transition-colors relative">
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

      <div className="flex items-center justify-end gap-3 mt-2 pl-5 relative z-10">
        {viewType === 'active' ? (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onComplete(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00f5d4]/10 text-[#00f5d4] border border-[#00f5d4]/20 text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-transform"
            >
              <Check size={12} strokeWidth={3} className="pointer-events-none" /> Concluir
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 active:scale-95 transition-transform"
            >
              <Edit2 size={14} className="pointer-events-none" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 active:scale-95 transition-transform"
            >
              <Trash2 size={14} className="pointer-events-none" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onComplete(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-transform"
            >
              <RotateCcw size={12} strokeWidth={3} className="pointer-events-none" /> Restaurar
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 active:scale-95 transition-transform"
            >
              <Trash2 size={14} className="pointer-events-none" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const ActionButton: React.FC<{ icon: React.ReactNode, className: string, onClick: () => void, title: string }> = ({ icon, className, onClick, title }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    title={title}
    className={`p-2 rounded-lg transition-all transform active:scale-90 shadow-lg cursor-pointer ${className}`}
  >
    {/* Wrapper para garantir que clique no ícone não interfira */}
    <span className="pointer-events-none">
      {icon}
    </span>
  </button>
);
