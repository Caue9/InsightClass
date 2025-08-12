import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, Role } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', role: '' as Role | '' });
  const [status, setStatus] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Autenticando…');
    try {
      if (!form.role) throw new Error('Escolha a função');
      await login(form.username, form.password, form.role);
      nav(`/${form.role}`);
    } catch (e: any) {
      setStatus(e?.message || 'Falha no login');
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow p-6 w-[min(520px,92vw)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white grid place-items-center font-bold">IC</div>
          <div>
            <div className="font-semibold text-slate-900">InsightClass</div>
            <div className="text-xs text-slate-500">Análise de sentimento de feedback escolar</div>
          </div>
        </div>
        <h2 className="text-lg font-semibold mb-3">Entrar</h2>
        <form className="grid gap-3" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-slate-600">Usuário</label>
            <input className="input" placeholder="seu.email@exemplo.com"
              value={form.username} onChange={e=>setForm({...form, username:e.target.value})} required />
          </div>
          <div>
            <label className="text-sm text-slate-600">Senha</label>
            <input className="input" type="password" placeholder="••••••••"
              value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
          </div>
          <div>
            <label className="text-sm text-slate-600">Função</label>
            <select className="input" value={form.role}
              onChange={e=>setForm({...form, role: e.target.value as Role})} required>
              <option value="">Selecione…</option>
              <option value="aluno">Aluno</option>
              <option value="professor">Professor</option>
              <option value="gestor">Gestor</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn">Entrar</button>
            {status && <span className="text-sm text-slate-600">{status}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}