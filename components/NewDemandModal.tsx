
import React, { useState, useEffect } from 'react';
import { Demand } from '../types';
import { X, Calendar } from 'lucide-react';

interface NewDemandModalProps {
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; due_date: string }) => void;
  initialData: Demand | null;
  defaultDate?: string;
}

export const NewDemandModal: React.FC<NewDemandModalProps> = ({ onClose, onSubmit, initialData, defaultDate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: defaultDate || new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        due_date: initialData.due_date
      });
    } else if (defaultDate) {
      setFormData(prev => ({ ...prev, due_date: defaultDate }));
    }
  }, [initialData, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#041c1c] border border-[#1a3a3a] rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="flex items-center justify-between p-8 border-b border-[#1a2e2e]">
          <div>
            <h3 className="text-2xl font-bold text-white">
              {initialData ? 'Editar Fluxo' : 'Nova Demanda'}
            </h3>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-medium">Longecta Workflow 2026</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-teal-500 uppercase tracking-widest ml-1">O que precisa ser feito?</label>
            <input
              autoFocus
              className="w-full bg-[#020f10] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all placeholder:text-gray-800 font-medium"
              placeholder="Ex: Revisão de Contratos Internacionais"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-teal-500 uppercase tracking-widest ml-1">Detalhes Adicionais</label>
            <textarea
              rows={3}
              className="w-full bg-[#020f10] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all resize-none placeholder:text-gray-800 text-sm leading-relaxed"
              placeholder="Liste os passos, links ou observações importantes..."
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-teal-500 uppercase tracking-widest ml-1">Prazo de Entrega</label>
            <div className="relative group">
              <div
                className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-600 group-focus-within:text-teal-400"
              >
                <Calendar size={18} />
              </div>
              <input
                type="date"
                className="w-full bg-[#020f10] border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all font-mono text-sm [color-scheme:dark]"
                value={formData.due_date}
                onChange={e => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                onClick={(e) => (e.target as HTMLInputElement).showPicker && (e.target as HTMLInputElement).showPicker()}
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-[#00f5d4] text-[#020f10] font-bold py-5 rounded-2xl hover:bg-[#00d1b5] transition-all shadow-[0_10px_30px_rgba(0,245,212,0.2)] active:scale-[0.98] uppercase tracking-widest text-xs"
            >
              {initialData ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR REGISTRO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
