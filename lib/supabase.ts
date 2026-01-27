
import { createClient } from '@supabase/supabase-js';

// Utilitário para pegar env de forma segura no Vite
const getEnv = (name: string): string => {
  try {
    return (import.meta as any).env[name] || '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

const createSafeClient = () => {
  if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
    try {
      return createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
      console.error("Erro crítico Supabase:", e);
    }
  }

  // Fallback para modo demonstração (não quebra a UI)
  const mockPromise = Promise.resolve({ data: null, error: null });
  return {
    auth: {
      getSession: () => mockPromise,
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => mockPromise,
      signUp: () => mockPromise,
      signOut: () => mockPromise,
    },
    from: () => ({
      select: () => ({
        eq: () => ({ neq: () => ({ order: () => mockPromise }), order: () => mockPromise }),
        order: () => mockPromise,
        single: () => mockPromise,
        limit: () => ({ single: () => mockPromise })
      }),
      insert: () => mockPromise,
      update: () => ({ eq: () => mockPromise }),
      delete: () => ({ eq: () => mockPromise }),
    }),
    channel: () => ({ 
      on: function() { return this; }, 
      subscribe: () => ({ track: () => Promise.resolve() }),
      presenceState: () => ({}),
      send: () => {}
    }),
    removeChannel: () => {},
    isMock: true
  } as any;
};

export const supabase = createSafeClient();
export const isSupabaseReady = !(supabase as any).isMock;
