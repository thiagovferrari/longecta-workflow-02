
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DemandList } from './components/DemandList';
import { CalendarSidebar } from './components/CalendarSidebar';
import { NewDemandModal } from './components/NewDemandModal';
import { LoginPage } from './components/LoginPage';
import { LiveSession } from './components/LiveSession';
import { ProjectsPage, NewProjectModal } from './components/ProjectsPage';
import { Demand, ViewType, PresenceUser, Project } from './types';
import { supabase, isSupabaseReady } from './lib/supabase';

const STORAGE_KEY = 'longecta_demands_backup';

// Helper para data hoje no formato YYYY-MM-DD
const getTodayStr = () => new Date().toISOString().split('T')[0];

const App: React.FC = () => {
  const [demands, setDemands] = useState<Demand[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ViewType>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDemand, setEditingDemand] = useState<Demand | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());

  const channelRef = useRef<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (s) {
          setSession(s);
        } else {
          const guest = localStorage.getItem('guest_session');
          if (guest) setSession(JSON.parse(guest));
        }
      } catch (e) {
        console.warn("Auth falhou");
      } finally {
        setLoading(false);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, s: any) => {
      if (s) setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    const setupLive = async () => {
      if (isSupabaseReady) {
        // 1. Get Workspace
        const { data: membership } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .limit(1)
          .single();

        const wId = membership?.workspace_id || 'main';
        setWorkspaceId(wId);

        // 2. Load Demands
        const { data } = await supabase
          .from('demands')
          .select('*')
          .eq('workspace_id', wId)
          .neq('state', 'deleted');
        if (data) setDemands(data);

        // 3. Load Projects
        const { data: projData } = await supabase
          .from('projects')
          .select('*')
          .neq('status', 'deleted')
          .order('date', { ascending: true });
        if (projData) setProjects(projData as any);

        // 4. Setup Realtime Channel
        const channel = supabase.channel(`room-${wId}`, {
          config: { presence: { key: session.user.id } }
        });

        // Listen for Demands Changes
        channel
          .on('postgres_changes', { event: '*', schema: 'public', table: 'demands' }, (payload: any) => {
            if (payload.eventType === 'INSERT') {
              setDemands(prev => [...prev.filter(d => d.id !== payload.new.id), payload.new]);
            } else if (payload.eventType === 'UPDATE') {
              setDemands(prev => prev.map(d => d.id === payload.new.id ? payload.new : d));
            } else if (payload.eventType === 'DELETE') {
              setDemands(prev => prev.filter(d => d.id !== payload.old.id));
            }
          })
          // Listen for Project Changes
          .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload: any) => {
            if (payload.eventType === 'INSERT') {
              setProjects(prev => [...prev.filter(p => p.id !== payload.new.id), payload.new].sort((a, b) => a.date.localeCompare(b.date)));
            } else if (payload.eventType === 'UPDATE') {
              setProjects(prev => prev.map(p => p.id === payload.new.id ? payload.new : p).sort((a, b) => a.date.localeCompare(b.date)));
            } else if (payload.eventType === 'DELETE') {
              setProjects(prev => prev.filter(p => p.id !== payload.old.id));
            }
          })
          .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            const users = Object.values(state).flat().map((p: any) => ({
              user_id: p.user_id,
              email: p.email,
              online_at: p.online_at
            }));
            setOnlineUsers(users);
          })
          .subscribe(async (status: string) => {
            if (status === 'SUBSCRIBED') {
              await channel.track({
                user_id: session.user.id,
                email: session.user.email,
                online_at: new Date().toISOString(),
              });
            }
          });

        channelRef.current = channel;
      }
    };

    setupLive();
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [session]);

  // Sincronização automática com localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demands));
  }, [demands]);

  const handleLogout = async () => {
    if (isSupabaseReady) await supabase.auth.signOut();
    localStorage.removeItem('guest_session');
    setSession(null);
    setWorkspaceId(null);
    setOnlineUsers([]);
  };

  const handleAction = async (formData: { title: string; description: string; due_date: string }) => {
    const id = editingDemand?.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const payload: Demand = {
      id,
      title: formData.title,
      description: formData.description,
      due_date: formData.due_date,
      workspace_id: workspaceId || 'local',
      created_by: session?.user?.id || 'guest',
      state: editingDemand?.state || 'active',
      updated_at: now,
      created_at: editingDemand?.created_at || now,
    };

    if (isSupabaseReady && workspaceId && workspaceId !== 'local') {
      try {
        // Optimistic / Immediate update to ensure UI response
        setDemands(prev => editingDemand
          ? prev.map(d => d.id === id ? { ...d, ...formData, updated_at: now } : d)
          : [...prev, payload]
        );

        if (editingDemand) {
          await supabase.from('demands').update(formData).eq('id', id);
        } else {
          await supabase.from('demands').insert([payload]);
        }
      } catch (err) {
        console.error("Erro Supabase:", err);
        // Revert could be implemented here if strict consistency is needed
      }
    } else {
      // Modo Mock/Offline
      setDemands(prev => editingDemand
        ? prev.map(d => d.id === id ? { ...d, ...formData, updated_at: now } : d)
        : [...prev, payload]
      );
    }

    setIsModalOpen(false);
    setEditingDemand(null);
  };

  const handleToggle = async (id: string) => {
    const d = demands.find(x => x.id === id);
    if (!d) return;
    const newState = d.state === 'completed' ? 'active' : 'completed';
    if (isSupabaseReady && workspaceId && workspaceId !== 'local') {
      await supabase.from('demands').update({ state: newState }).eq('id', id);
    } else {
      setDemands(prev => prev.map(x => x.id === id ? { ...x, state: newState } : x));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir demanda?')) return;
    if (isSupabaseReady && workspaceId && workspaceId !== 'local') {
      await supabase.from('demands').update({ state: 'deleted' }).eq('id', id);
    } else {
      setDemands(prev => prev.filter(x => x.id !== id));
    }
  };

  const filtered = useMemo(() => {
    return demands.filter(d => activeTab === 'active' ? d.state === 'active' : d.state === 'completed')
      .sort((a, b) => a.due_date.localeCompare(b.due_date));
  }, [demands, activeTab]);

  const demandsByDate = useMemo(() => {
    return demands.filter(d => d.state === 'active').reduce((acc, d) => {
      if (!acc[d.due_date]) acc[d.due_date] = [];
      acc[d.due_date].push(d);
      return acc;
    }, {} as Record<string, Demand[]>);
  }, [demands]);

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#020f10]">
      <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
    </div>
  );

  if (!session) return <LoginPage onLogin={(s) => setSession(s)} />;

  return (
    <div className="flex h-screen text-gray-200 overflow-hidden bg-[#020f10]">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={session.user}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onlineUsers={onlineUsers} />

        <main className="flex-1 flex overflow-hidden p-8 gap-8">
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {activeTab !== 'projects' ? (
              <DemandList
                demands={filtered}
                viewType={activeTab}
                onNewDemand={() => { setEditingDemand(null); setIsModalOpen(true); }}
                onDelete={handleDelete}
                onComplete={handleToggle}
                onEdit={(d) => { setEditingDemand(d); setIsModalOpen(true); }}
              />
            ) : (
              <ProjectsPage
                projects={projects}
                onNewProject={() => { setEditingProject(null); setIsProjectModalOpen(true); }}
                onDelete={async (id) => {
                  if (!confirm('Excluir projeto?')) return;
                  if (isSupabaseReady) await supabase.from('projects').delete().eq('id', id);
                  else setProjects(prev => prev.filter(p => p.id !== id));
                }}
                onEdit={(p) => { setEditingProject(p); setIsProjectModalOpen(true); }}
              />
            )}
          </div>

          <div className="w-[420px] flex-shrink-0 flex flex-col gap-6">
            {/* <LiveSession channel={channelRef.current} currentUser={session.user} /> Removido conforme solicitado */}
            <CalendarSidebar
              demandsByDate={demandsByDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
        </main>
      </div>

      {isModalOpen && (
        <NewDemandModal
          onClose={() => { setIsModalOpen(false); setEditingDemand(null); }}
          onSubmit={handleAction}
          initialData={editingDemand}
          defaultDate={selectedDate}
          defaultDate={selectedDate}
        />
      )}

      {isProjectModalOpen && (
        <NewProjectModal
          onClose={() => { setIsProjectModalOpen(false); setEditingProject(null); }}
          initialData={editingProject}
          onSubmit={async (data) => {
            const id = editingProject?.id || crypto.randomUUID();
            const now = new Date().toISOString();
            const fullProject = {
              ...data,
              id,
              created_by: session.user.id,
              created_at: editingProject?.created_at || now,
              updated_at: now
            };

            if (isSupabaseReady) {
              if (editingProject) {
                await supabase.from('projects').update(data).eq('id', id);
              } else {
                await supabase.from('projects').insert([fullProject]);
              }
            } else {
              setProjects(prev => editingProject
                ? prev.map(p => p.id === id ? { ...p, ...data } : p)
                : [...prev, fullProject as Project]
              );
            }
            setIsProjectModalOpen(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
