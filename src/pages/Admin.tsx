import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Users, Check, X, Loader2, LogOut, Search, Crown, Settings, Plus, Key } from 'lucide-react';

interface User {
  id: number;
  uid: string;
  email: string;
  name: string | null;
  isPro: boolean;
  proSource: string | null;
  proSince: string | null;
  grantedBy: string | null;
  createdAt: string;
}

interface Admin {
  id: number;
  email: string;
  createdAt: string;
}

type Tab = 'users' | 'settings';

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('users');
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const adminEmail = localStorage.getItem('adminEmail');

  useEffect(() => {
    if (!token || token === 'undefined' || token === 'null') {
      navigate('/admin-login');
      return;
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!token || token === 'undefined' || token === 'null') {
      navigate('/admin-login');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (adminEmail) {
      document.title = `Admin - ${adminEmail}`;
    }
  }, [adminEmail]);

  const fetchData = async () => {
    try {
      const [usersRes, adminsRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/admins', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (usersRes.status === 401 || usersRes.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/admin-login');
        return;
      }
      
      const usersData = await usersRes.json();
      const adminsData = await adminsRes.json();
      
      setUsers(usersData.users);
      setAdmins(adminsData.admins);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/admin-login');
        return;
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrantPro = async (email: string) => {
    setActionLoading(email);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/admin/grant-pro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      setSuccess('Acesso PRO concedido com sucesso');
      await fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokePro = async (email: string) => {
    setActionLoading(email);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/admin/revoke-pro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      setSuccess('Acesso PRO revogado com sucesso');
      await fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangePassword = async () => {
    if (!adminEmail) {
      setError('Sessão expirada. Faça login novamente.');
      return;
    }
    setActionLoading('password');
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      setSuccess('Senha alterada com sucesso');
      setCurrentPassword('');
      setNewPassword('');
      setShowPasswordModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateAdmin = async () => {
    setActionLoading('create-admin');
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      setSuccess('Administrador criado com sucesso');
      const adminsRes = await fetch('/api/admin/admins', { headers: { Authorization: `Bearer ${token}` } });
      const adminsData = await adminsRes.json();
      setAdmins(adminsData.admins);
      setNewAdminEmail('');
      setNewAdminPassword('');
      setShowAdminModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-login');
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-display font-bold text-white">
                Painel Admin <span className="text-emerald-500">tarjaDOC</span>
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'users' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'settings' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            Configurações
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            {success}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-slate-400" />
                  <h2 className="text-lg font-semibold text-white">Usuários</h2>
                  <span className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-slate-300">
                    {users.length}
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por email ou nome..."
                    className="pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm w-64"
                  />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Fonte
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Desde
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Criado em
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {user.name || 'Sem nome'}
                            </div>
                            <div className="text-sm text-slate-400">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.isPro ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">
                              <Crown className="w-3 h-3" />
                              PRO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 text-slate-400 rounded-full text-xs font-medium">
                              Grátis
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {user.proSource === 'stripe' && 'Stripe'}
                          {user.proSource === 'manual' && `Manual (${user.grantedBy})`}
                          {!user.proSource && '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {user.proSince ? new Date(user.proSince).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {actionLoading === user.email ? (
                            <Loader2 className="w-5 h-5 text-emerald-500 animate-spin ml-auto" />
                          ) : user.isPro ? (
                            <button
                              onClick={() => handleRevokePro(user.email)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Revogar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGrantPro(user.email)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-sm transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              Liberar PRO
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-slate-400" />
                  <h2 className="text-lg font-semibold text-white">Alterar Senha</h2>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm transition-colors"
                >
                  Alterar Senha
                </button>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-slate-400" />
                    <h2 className="text-lg font-semibold text-white">Administradores</h2>
                    <span className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-slate-300">
                      {admins.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAdminModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Admin
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {admins.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                      <div>
                        <div className="text-sm font-medium text-white">{admin.email}</div>
                        <div className="text-xs text-slate-400">
                          Criado em {new Date(admin.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Alterar Senha</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Senha Atual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Nova Senha</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePassword}
                disabled={actionLoading === 'password'}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50"
              >
                {actionLoading === 'password' ? 'Alterando...' : 'Alterar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdminModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Novo Administrador</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Senha</label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAdminModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAdmin}
                disabled={actionLoading === 'create-admin'}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50"
              >
                {actionLoading === 'create-admin' ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
