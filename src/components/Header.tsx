import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, LogOut, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { currentUser, isPro, logout } = useAuth();

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {}
    }
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <Link to="/">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </Link>
            <Link to="/">
              <span className="text-xl font-display font-bold text-slate-900 tracking-tight">
                tarja<span className="text-emerald-600">DOC</span>
              </span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Como Funciona</a>
            <a href="#casos-de-uso" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Casos de Uso</a>
            <a href="#precos" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Preços</a>
            <a href="#ferramenta" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Ferramenta</a>
            
            {currentUser ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">
                    {currentUser.name?.charAt(0) || currentUser.email.charAt(0).toUpperCase()}
                  </div>
                  {isPro && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold rounded-full shadow-sm">
                      <Crown className="w-3 h-3" />
                      PRO
                    </span>
                  )}
                  <span className="text-sm font-medium text-slate-700 hidden lg:block">
                    {currentUser.name || currentUser.email}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
                >
                  Entrar
                </Link>
                <Link 
                  to="/register"
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all"
                >
                  Comece Grátis
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
