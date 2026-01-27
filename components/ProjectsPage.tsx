import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, Link as LinkIcon, Image as ImageIcon, X } from 'lucide-react';
import { Project } from '../types';
import { supabase, isSupabaseReady } from '../lib/supabase';

interface ProjectsPageProps {
    onNewProject: () => void;
    projects: Project[];
    onDelete: (id: string) => void;
    onEdit: (project: Project) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNewProject, projects, onDelete, onEdit }) => {
    return (
        <div className="max-w-6xl w-full mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-baseline gap-3">
                    <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
                        Meus Projetos
                    </h2>
                    <div className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-md backdrop-blur-md">
                        <span className="text-purple-400 text-sm font-bold">{projects.length}</span>
                    </div>
                </div>

                <button
                    onClick={onNewProject}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#d400f5] hover:bg-[#b500d1] text-white rounded-xl text-xs font-bold tracking-wider transition-all shadow-[0_4px_15px_rgba(212,0,245,0.4)] active:scale-95"
                >
                    <Plus size={16} strokeWidth={3} />
                    NOVO PROJETO
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {projects.length > 0 ? (
                    projects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onDelete={() => onDelete(project.id)}
                            onEdit={() => onEdit(project)}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-gray-500 gap-4 bg-black/40 border border-white/10 rounded-2xl">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
                            <ImageIcon size={20} />
                        </div>
                        <p className="text-sm font-medium italic">Nenhum projeto cadastrado.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProjectCard: React.FC<{
    project: Project;
    onDelete: () => void;
    onEdit: () => void;
}> = ({ project, onDelete, onEdit }) => {
    const statusColors = {
        active: 'bg-green-500 text-green-950 border-green-400',
        completed: 'bg-blue-500 text-blue-950 border-blue-400',
        prospect: 'bg-yellow-500 text-yellow-950 border-yellow-400',
    };

    // Format Date for High Visibility (Day / Month)
    const dateObj = new Date(project.date + 'T12:00:00');
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');

    return (
        <div className="group relative bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] flex flex-col h-[260px] w-full">
            {/* Imagem de Capa */}
            <div className="h-[140px] w-full bg-gray-900 relative overflow-hidden">
                {project.image_url ? (
                    <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-700 bg-gray-900/50">
                        <ImageIcon size={24} />
                    </div>
                )}

                {/* Status Dot */}
                <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${statusColors[project.status].split(' ')[0]} shadow-[0_0_8px_currentColor]`} title={project.status} />

                {/* Prominent Date Badge */}
                <div className="absolute bottom-0 left-2 translate-y-1/3 bg-[#0a0a0a] border border-white/10 rounded-lg p-1.5 flex flex-col items-center justify-center shadow-lg z-10 w-12 group-hover:border-purple-500/50 transition-colors">
                    <span className="text-md font-bold text-white leading-none">{day}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase leading-none mt-0.5">{month}</span>
                </div>
            </div>

            <div className="pt-5 px-3 pb-3 flex flex-col flex-1 gap-1">
                <h3 className="text-sm font-bold text-white leading-tight line-clamp-2" title={project.title}>
                    {project.title}
                </h3>

                {project.website && (
                    <a
                        href={project.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-auto truncate"
                    >
                        <LinkIcon size={10} />
                        <span className="truncate">{project.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                )}
            </div>

            {/* Ações Hover */}
            <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="p-1.5 bg-black/60 backdrop-blur-md rounded-md text-white hover:bg-white/20 transition-colors"
                    title="Editar"
                >
                    <Edit2 size={12} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5 bg-black/60 backdrop-blur-md rounded-md text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Excluir"
                >
                    <Trash2 size={12} />
                </button>
            </div>
        </div>
    );
};

interface ProjectModalProps {
    onClose: () => void;
    onSubmit: (data: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => Promise<void>;
    initialData?: Project | null;
}

export const NewProjectModal: React.FC<ProjectModalProps> = ({ onClose, onSubmit, initialData }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [website, setWebsite] = useState(initialData?.website || '');
    const [status, setStatus] = useState<Project['status']>(initialData?.status || 'active');
    const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        if (file.size > 4 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 4MB.');
            return;
        }

        setUploading(true);
        try {
            if (isSupabaseReady) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('covers')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('covers')
                    .getPublicUrl(filePath);

                setImageUrl(publicUrl);
            } else {
                // Mock upload handling (base64)
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImageUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            alert('Erro ao enviar imagem.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({ title, description, date, website, status, image_url: imageUrl });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">
                    {initialData ? 'Editar Projeto' : 'Novo Projeto'}
                </h2>
                <p className="text-gray-400 text-sm mb-8">
                    Preencha os dados do projeto abaixo.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome do Projeto</label>
                        <input
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all placeholder:text-gray-700"
                            placeholder="Ex: Landing Page Cliente X"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Data do Evento</label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all [color-scheme:dark]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value as any)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all appearance-none"
                            >
                                <option value="active" className="bg-[#0a0a0a]">Ativo</option>
                                <option value="completed" className="bg-[#0a0a0a]">Concluído</option>
                                <option value="prospect" className="bg-[#0a0a0a]">Prospectar</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Link Website</label>
                        <input
                            type="url"
                            value={website}
                            onChange={e => setWebsite(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all placeholder:text-gray-700"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descrição</label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all placeholder:text-gray-700 resize-none"
                            placeholder="Detalhes sobre o projeto..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Capa (Max 4MB)</label>
                        <div className="flex items-center gap-4">
                            {imageUrl && (
                                <img src={imageUrl} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-white/20" />
                            )}
                            <label className="flex-1 cursor-pointer group">
                                <div className="w-full bg-white/5 border border-dashed border-white/20 rounded-xl px-4 py-3 flex items-center justify-center text-sm text-gray-400 group-hover:border-purple-500/50 group-hover:text-purple-400 transition-all">
                                    {uploading ? 'Enviando...' : (imageUrl ? 'Alterar Imagem' : 'Upload de Imagem')}
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-[#d400f5] hover:bg-[#b500d1] text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(212,0,245,0.3)] active:scale-[0.98] mt-4"
                    >
                        {initialData ? 'SALVAR ALTERAÇÕES' : 'CRIAR PROJETO'}
                    </button>
                </form>
            </div>
        </div>
    );
};
