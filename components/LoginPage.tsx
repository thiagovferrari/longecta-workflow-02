
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase, isSupabaseReady } from '../lib/supabase';

interface LoginPageProps {
  onLogin: (session: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (!isSupabaseReady) {
      // Simulação de login bem sucedido se o Supabase não estiver configurado
      setTimeout(() => {
        const mockSession = {
          user: { id: 'guest-' + Date.now(), email: email || 'convidado@longecta.com' }
        };
        localStorage.setItem('guest_session', JSON.stringify(mockSession));
        onLogin(mockSession);
        setIsLoading(false);
      }, 800);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Conta criada! Verifique seu e-mail para confirmar.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLogin(data.session);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar. Verifique seus dados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[100] bg-[#020f10]">
      {/* Background Decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/30 to-emerald-600/30 rounded-[2.5rem] blur opacity-40"></div>
        
        <div className="relative bg-[#041c1c]/80 border border-white/10 backdrop-blur-3xl rounded-[2rem] p-10 shadow-2xl flex flex-col items-center">
          
          <div className="w-20 h-20 bg-teal-500/20 border border-teal-500/40 rounded-2xl flex items-center justify-center text-[#00f5d4] mb-8 shadow-[0_0_30px_rgba(0,245,212,0.2)]">
            <ShieldCheck size={40} strokeWidth={1.5} />
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white tracking-tight mb-3">Longecta</h1>
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm uppercase tracking-[0.3em] font-light">
              <Sparkles size={12} className="text-teal-400" />
              SISTEMA DE FLUXO
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold p-4 rounded-xl uppercase text-center animate-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            {!isSupabaseReady && (
              <div className="bg-yellow-500/5 border border-yellow-500/10 text-yellow-500/70 text-[10px] p-3 rounded-lg text-center font-medium italic">
                Modo Demonstração Ativado
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">E-mail de Acesso</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-teal-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email"
                  required
                  placeholder="admin@longecta.com"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all placeholder:text-gray-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Senha de Segurança</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-teal-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all placeholder:text-gray-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-[#00f5d4] hover:bg-[#00d1b5] text-[#020f10] font-bold py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(0,245,212,0.2)] active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-[#020f10]/20 border-t-[#020f10] rounded-full animate-spin" />
              ) : (
                <>
                  <span className="tracking-widest">{isSignUp ? 'CRIAR ACESSO' : 'ENTRAR NO FLUXO'}</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="mt-8 text-[11px] font-bold text-gray-500 hover:text-teal-400 uppercase tracking-[0.2em] transition-colors"
          >
            {isSignUp ? 'Já possui acesso? Conectar' : 'Primeiro acesso? Cadastrar'}
          </button>
          
          <div className="mt-10 pt-8 border-t border-white/5 w-full text-center">
            <p className="text-gray-700 text-[10px] uppercase tracking-[0.25em] font-medium">
              WorkFlow Engine 02 © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
