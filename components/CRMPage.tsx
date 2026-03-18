import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, X, Phone, Mail, User } from 'lucide-react';
import { CRMLead } from '../types';
import { supabase, isSupabaseReady } from '../lib/supabase';

interface CRMPageProps {
  onNewLead: () => void;
  leads: CRMLead[];
  onDelete: (id: string) => void;
  onEdit: (lead: CRMLead) => void;
}

export const CRMPage: React.FC<CRMPageProps> = ({ onNewLead, leads, onDelete, onEdit }) => {
  return (
    <div className="max-w-7xl w-full mx-auto pb-8 md:pb-0">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-md">
            CRM: Oportunidades
          </h2>
          <div className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/30 rounded-md backdrop-blur-md">
            <span className="text-cyan-400 text-sm font-bold">{leads.length}</span>
          </div>
        </div>

        <button
          onClick={onNewLead}
          className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-[10px] md:text-xs font-bold tracking-wider transition-all shadow-[0_4px_15px_rgba(6,182,212,0.4)] active:scale-95 whitespace-nowrap"
        >
          <Plus size={16} strokeWidth={3} />
          <span className="hidden md:inline">NOVO CADASTRO</span>
          <span className="md:hidden">NOVO</span>
        </button>
      </div>

      <div className="w-full flex flex-col gap-3">
        {leads.length > 0 ? (
          <div className="w-full overflow-x-auto custom-scrollbar pb-4">
            <div className="min-w-[900px]">
              {/* Header Table - Minimalist */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 mb-2">
                <div className="col-span-3">Nome & E-mail</div>
                <div className="col-span-2">Telefone</div>
                <div className="col-span-2">Oportunidade</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1 text-center" title="Próximo Contato">Retorno</div>
                <div className="col-span-1 text-center">Proposta</div>
                <div className="col-span-1 text-right">Ações</div>
              </div>

              {/* Rows */}
              <div className="flex flex-col gap-2">
                {leads.map(lead => (
                  <CRMLeadRow
                    key={lead.id}
                    lead={lead}
                    onDelete={() => onDelete(lead.id)}
                    onEdit={() => onEdit(lead)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full py-16 md:py-24 flex flex-col items-center justify-center text-gray-500 gap-4 bg-black/40 border border-white/10 rounded-2xl mx-4 md:mx-0">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
              <User size={20} />
            </div>
            <p className="text-sm font-medium italic">Nenhum cadastro encontrado no CRM.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CRMLeadRow: React.FC<{
  lead: CRMLead;
  onDelete: () => void;
  onEdit: () => void;
}> = ({ lead, onDelete, onEdit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'em_contato': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'acao_necessaria': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'aguardando_retorno': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'convertido': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'perdido': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getContactDateColor = (dateStr?: string) => {
    if (!dateStr) return 'text-gray-600';
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'text-green-400 font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]';
    if (dateStr < today) return 'text-orange-400 font-bold drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]';
    return 'text-white';
  };

  const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const [, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  return (
    <div className="grid grid-cols-12 gap-4 items-center px-6 py-4 glass-panel rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all hover:bg-white/[0.02] group">
      {/* Name & Email */}
      <div className="col-span-3 flex flex-col truncate pr-4">
        <span className="text-sm font-bold text-white truncate">{lead.name}</span>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
          <Mail size={10} />
          <span className="truncate">{lead.email || '—'}</span>
        </div>
      </div>

      {/* Phone */}
      <div className="col-span-2 flex items-center gap-2 text-sm text-gray-300">
        <Phone size={12} className="text-gray-500" />
        <span className="truncate">{lead.phone || '—'}</span>
      </div>

      {/* Opportunity */}
      <div className="col-span-2 pr-4">
        <p className="text-sm text-gray-400 truncate w-full" title={lead.opportunity}>
          {lead.opportunity || '—'}
        </p>
      </div>

      {/* Status */}
      <div className="col-span-2 flex items-center">
        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getStatusColor(lead.status)} text-center truncate`}>
          {getStatusLabel(lead.status)}
        </span>
      </div>

      {/* Next Contact Date */}
      <div className="col-span-1 flex items-center justify-center">
        <span className={`text-xs ${getContactDateColor(lead.next_contact_date)}`} title={lead.next_contact_date ? `Entrar em contato dia ${lead.next_contact_date}` : 'Sem data agendada'}>
          {formatShortDate(lead.next_contact_date)}
        </span>
      </div>

      {/* Proposal (PDF) */}
      <div className="col-span-1 flex items-center justify-center">
        {lead.proposal_url ? (
          <a
            href={lead.proposal_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 rounded-xl transition-all border border-transparent hover:border-cyan-400/20"
            title="Ver Proposta"
          >
            <FileText size={18} />
          </a>
        ) : (
          <span className="text-gray-600 text-xs">—</span>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          title="Editar Cadastro"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          title="Excluir Cadastro"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

interface NewLeadModalProps {
  onClose: () => void;
  onSubmit: (data: Omit<CRMLead, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: CRMLead | null;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ onClose, onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [opportunity, setOpportunity] = useState(initialData?.opportunity || '');
  const [status, setStatus] = useState<CRMLead['status']>(initialData?.status || 'novo');
  const [nextContactDate, setNextContactDate] = useState(initialData?.next_contact_date || '');
  const [proposalUrl, setProposalUrl] = useState(initialData?.proposal_url || '');
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState(initialData?.proposal_url ? 'Proposta anexada' : '');

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file.type !== 'application/pdf') {
      alert('Apenas arquivos PDF são permitidos.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('O PDF deve ter no máximo 10MB.');
      return;
    }

    setUploading(true);
    setFileName(file.name);
    try {
      if (isSupabaseReady) {
        const fileExt = file.name.split('.').pop();
        const randName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `crm_proposals/${randName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents') // Usando um bucket genérico ou 'documents'
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        setProposalUrl(publicUrl);
      } else {
        // Mock upload handling (base64)
        const reader = new FileReader();
        reader.onloadend = () => {
          setProposalUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Erro no upload de PDF:', error);
      alert('Erro ao enviar o PDF. O bucket "documents" pode não existir no Supabase. Usando mock temporário.');
      // Fallback fallback to base64 if bucket fails
      const reader = new FileReader();
      reader.onloadend = () => {
        setProposalUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, email, phone, opportunity, status, next_contact_date: nextContactDate || undefined, proposal_url: proposalUrl });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0a0a09] border border-cyan-500/20 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.1)] p-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <User size={20} />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {initialData ? 'Editar Cadastro CRM' : 'Novo Cadastro CRM'}
          </h2>
        </div>
        <p className="text-gray-400 text-sm mb-8 pl-13">
          Preencha os dados da oportunidade abaixo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nome e Telefone grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-cyan-500/80 uppercase tracking-wider">Nome do Contato/Empresa</label>
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700 font-medium"
                placeholder="Ex: João Silva ou Empresa X"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-cyan-500/80 uppercase tracking-wider">Telefone</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-cyan-500/80 uppercase tracking-wider">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700"
              placeholder="contato@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-cyan-500/80 uppercase tracking-wider">Anotações da Oportunidade</label>
            <textarea
              required
              rows={3}
              value={opportunity}
              onChange={e => setOpportunity(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700 resize-none"
              placeholder="Descreva o que este contato deseja, histórico de conversas, etc..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-cyan-500/80 uppercase tracking-wider">Status do Funil</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all appearance-none cursor-pointer"
                >
                  <option value="novo" className="bg-[#0a0a09]">🆕 Novo Lead</option>
                  <option value="em_contato" className="bg-[#0a0a09]">💬 Em Contato</option>
                  <option value="acao_necessaria" className="bg-[#0a0a09]">⚡ Ação Necessária</option>
                  <option value="aguardando_retorno" className="bg-[#0a0a09]">⏳ Aguardando Retorno</option>
                  <option value="convertido" className="bg-[#0a0a09]">✅ Convertido (Fechou!)</option>
                  <option value="perdido" className="bg-[#0a0a09]">❌ Perdido</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-cyan-500/80 uppercase tracking-wider">Próximo Contato (Opcional)</label>
              <input
                type="date"
                value={nextContactDate}
                onChange={e => setNextContactDate(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-cyan-500/80 uppercase tracking-wider">Proposta Comercial (PDF)</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <label className="flex-1 w-full cursor-pointer group">
                <div className={`w-full border border-dashed rounded-xl px-4 py-4 flex flex-col items-center justify-center text-sm transition-all ${
                  fileName ? 'bg-cyan-500/5 border-cyan-500/30 text-cyan-400' : 'bg-white/5 border-white/20 text-gray-400 group-hover:border-cyan-500/50 group-hover:text-cyan-400 group-hover:bg-cyan-500/5'
                }`}>
                  <FileText justify-center size={24} className="mb-2 opacity-50" />
                  {uploading ? 'Processando PDF...' : (fileName ? fileName : 'Clique para anexar um PDF')}
                </div>
                <input type="file" className="hidden" accept="application/pdf" onChange={handlePdfUpload} disabled={uploading} />
              </label>
              {proposalUrl && (
                <a 
                  href={proposalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl border border-white/10 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <FileText size={16} /> Ver Arquivo
                </a>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_25px_rgba(6,182,212,0.3)] hover:shadow-[0_4px_30px_rgba(6,182,212,0.5)] active:scale-[0.98] flex justify-center items-center gap-2"
            >
              {initialData ? 'SALVAR ALTERAÇÕES' : 'SALVAR NO CRM'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
