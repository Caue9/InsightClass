import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, Role } from '../context/AuthContext';
import { enviarFeedback, listarFeedbacks, type Target } from '../lib/api';

export default function Professor() {
  const { session, logout } = useAuth();
  const [form, setForm] = useState({ texto:'', target_type:'turma' as Target, course_code:'' });
  const [status, setStatus] = useState('');
  const [course, setCourse] = useState('');
  const [itens, setItens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Enviando…');
    try{
      await enviarFeedback({
        texto: form.texto,
        author_role: (session?.role || 'professor') as Role,
        target_type: form.target_type,
        course_code: form.course_code || undefined,
      });
      setStatus('Enviado!');
      setForm({ ...form, texto:'' });
    } catch { setStatus('Erro ao enviar.'); }
  }

  async function carregar() {
    setLoading(true);
    try {
      const data = await listarFeedbacks({ course_code: course || undefined, limit: 30 });
      const items = Array.isArray(data) ? data : data.items || [];
      setItens(items);
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header current="professor" onLogout={logout} />
      <main className="max-w-5xl mx-auto px-4 py-8 grid gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-3">Enviar Feedback (Professor)</h2>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div>
              <label className="label">Seu feedback</label>
              <textarea className="input min-h-[120px]" value={form.texto}
                onChange={e=>setForm({...form, texto:e.target.value})} required />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="label">Sobre quem/oq</label>
                <select className="input" value={form.target_type}
                  onChange={e=>setForm({...form, target_type: e.target.value as Target})}>
                  <option value="turma">Turma</option>
                  <option value="curso">Curso</option>
                  <option value="professor">Professor</option>
                  <option value="coordenacao">Coordenação</option>
                </select>
              </div>
              <div>
                <label className="label">Disciplina (opcional)</label>
                <input className="input" placeholder="Ex.: MAT-101" value={form.course_code}
                  onChange={e=>setForm({...form, course_code:e.target.value})}/>
              </div>
              <div>
                <label className="label">Quem fala</label>
                <input className="input" value="professor" disabled />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn">Enviar</button>
              {status && <span className="text-sm text-slate-600">{status}</span>}
            </div>
          </form>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-3">Visão Geral Rápida</h2>
          <div className="flex items-end gap-3">
            <div>
              <label className="label">Disciplina</label>
              <input className="input" placeholder="Ex.: MAT-101" value={course} onChange={e=>setCourse(e.target.value)} />
            </div>
            <button className="btn" onClick={carregar} disabled={loading}>{loading?'Carregando…':'Carregar'}</button>
          </div>
          <div className="grid gap-3 mt-4">
            {itens.map((f, i)=>(
              <div key={i} className="border rounded-xl p-4 bg-white">
                <div className="text-sm text-slate-500 mb-1">
                  {f.author_role} → {f.target_type} {f.course_code?`· ${f.course_code}`:''}
                  {f.submitted_at ? ` · ${new Date(f.submitted_at).toLocaleString('pt-BR')}` : ''}
                </div>
                <div className="text-slate-900">{f.texto}</div>
                {f.label && <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs ${f.label==='positivo'?'bg-emerald-100 text-emerald-700':f.label==='neutro'?'bg-sky-100 text-sky-700':'bg-rose-100 text-rose-700'}`}>{f.label}</span>}
              </div>
            ))}
            {!loading && itens.length===0 && <div className="text-sm text-slate-600">Sem dados ainda.</div>}
          </div>
        </div>
      </main>
    </div>
  );
}

function Header(props:any){ return <AlunoHeader {...props}/> }
function AlunoHeader({current,onLogout}:{current:'aluno'|'professor'|'gestor',onLogout:()=>void}){
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-slate-900 text-white grid place-items-center text-sm font-bold">IC</div>
          <h1 className="font-semibold text-slate-900">InsightClass</h1>
        </div>
        <nav className="flex gap-1">
          <Tab to="/aluno" label="Aluno" active={current==='aluno'}/>
          <Tab to="/professor" label="Professor" active={current==='professor'}/>
          <Tab to="/gestor" label="Gestor" active={current==='gestor'}/>
          <button className="btn ghost" onClick={onLogout}>Sair</button>
        </nav>
      </div>
    </header>
  );
}

function Tab({to,label,active}:{to:string;label:string;active?:boolean}) {
  return <Link to={to} className={`px-3 py-2 rounded-xl text-sm font-medium ${active?'bg-slate-900 text-white':'text-slate-700 hover:bg-slate-100'}`}>{label}</Link>;
}