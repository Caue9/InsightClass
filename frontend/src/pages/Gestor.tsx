// src/pages/Gestor.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listarFeedbacks, type FeedbackItem, type SentLabel } from '../lib/api';
import {
  addSubject, listSubjects, removeSubject,
  addTeacher, listTeachers, removeTeacher,
  addStudent, listStudents, removeStudent
} from '../lib/mockStore';
import type { Subject, Teacher, Student } from '../lib/types';

type TabKey = 'feedbacks' | 'subjects' | 'teachers' | 'students';

export default function Gestor() {
  const { logout } = useAuth();
  const [tab, setTab] = useState<TabKey>('feedbacks');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header current="gestor" onLogout={logout} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow p-4">
          <div className="flex gap-2 mb-4">
            <Tab label="Feedbacks"   active={tab==='feedbacks'} onClick={()=>setTab('feedbacks')} />
            <Tab label="Matérias"    active={tab==='subjects'}  onClick={()=>setTab('subjects')} />
            <Tab label="Professores" active={tab==='teachers'}  onClick={()=>setTab('teachers')} />
            <Tab label="Alunos"      active={tab==='students'}  onClick={()=>setTab('students')} />
          </div>

          {tab==='feedbacks' && <FeedbacksPanel />}
          {tab==='subjects'  && <SubjectsPanel />}
          {tab==='teachers'  && <TeachersPanel />}
          {tab==='students'  && <StudentsPanel />}
        </div>
      </main>
    </div>
  );
}

function Header({current,onLogout}:{current:'aluno'|'professor'|'gestor',onLogout:()=>void}) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-slate-900 text-white grid place-items-center text-sm font-bold">IC</div>
          <h1 className="font-semibold text-slate-900">InsightClass</h1>
        </div>
        <nav className="flex gap-1">
          <TabLink to="/aluno" label="Aluno" />
          <TabLink to="/professor" label="Professor" />
          <TabLink to="/gestor" label="Gestor" active />
          <button className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100" onClick={onLogout}>Sair</button>
        </nav>
      </div>
    </header>
  );
}
function TabLink({to,label,active}:{to:string;label:string;active?:boolean}) {
  return <Link to={to} className={`px-3 py-2 rounded-xl text-sm font-medium ${active?'bg-slate-900 text-white':'text-slate-700 hover:bg-slate-100'}`}>{label}</Link>;
}
function Tab({label,active,onClick}:{label:string;active?:boolean;onClick:()=>void}) {
  return <button onClick={onClick} className={`px-3 py-2 rounded-xl text-sm font-medium ${active?'bg-slate-900 text-white':'text-slate-700 hover:bg-slate-100'}`}>{label}</button>;
}

/* -------- Painel de feedbacks -------- */
function FeedbacksPanel() {
  const [course, setCourse] = useState('');
  const [role, setRole] = useState<'' | 'aluno' | 'professor' | 'gestor'>('');
  const [limit, setLimit] = useState(50);
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);

  const kpi = useMemo(() => {
    const c: Record<SentLabel, number> = { positivo: 0, neutro: 0, negativo: 0 };
    for (const i of items) {
      if (i.label) c[i.label] += 1;
    }
    return c;
  }, [items]);

  async function load() {
    setLoading(true);
    try {
      const data = await listarFeedbacks({
        course_code: course || undefined,
        author_role: (role || undefined) as any,
        limit
      });
      setItems(Array.isArray(data) ? (data as FeedbackItem[]) : (data.items || []));
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        <div>
          <label className="text-sm text-slate-600">Curso</label>
          <input className="input" placeholder="MAT-101" value={course} onChange={e=>setCourse(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-slate-600">Papel</label>
          <select className="input" value={role} onChange={e=>setRole(e.target.value as any)}>
            <option value="">Todos</option>
            <option value="aluno">Aluno</option>
            <option value="professor">Professor</option>
            <option value="gestor">Gestor</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-600">Limite</label>
          <input className="input" type="number" min={1} max={500} value={limit} onChange={e=>setLimit(Number(e.target.value||50))}/>
        </div>
        <div className="flex items-end">
          <button className="btn" onClick={load} disabled={loading}>{loading?'Carregando…':'Carregar'}</button>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <span className="chip">Total: {items.length}</span>
        <span className="chip">Positivo: {kpi.positivo}</span>
        <span className="chip">Neutro: {kpi.neutro}</span>
        <span className="chip">Negativo: {kpi.negativo}</span>
      </div>

      <div className="grid gap-3">
        {items.map((f, i) => (
          <div key={i} className="border rounded-xl p-4 bg-white">
            <div className="text-sm text-slate-500 mb-1">
              {f.author_role} → {f.target_type} {f.course_code ? `· ${f.course_code}` : ''}
              {f.teacher_id ? ` · ${f.teacher_id}` : ''}
              {f.submitted_at ? ` · ${new Date(f.submitted_at).toLocaleString('pt-BR')}` : ''}
            </div>
            <div className="text-slate-900">{f.texto}</div>
            {f.label && (
              <span
                className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs ${
                  f.label === 'positivo'
                    ? 'bg-emerald-100 text-emerald-700'
                    : f.label === 'neutro'
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {f.label}
              </span>
            )}
          </div>
        ))}
        {!loading && items.length === 0 && <div className="text-sm text-slate-600">Nenhum feedback encontrado.</div>}
      </div>
    </div>
  );
}

/* -------- Painel de matérias -------- */
function SubjectsPanel() {
  const [list, setList] = useState<Subject[]>([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  async function refresh(){ setList(await listSubjects()); }
  useEffect(()=>{ refresh(); },[]);

  async function add(e:React.FormEvent){
    e.preventDefault();
    await addSubject({ code: code.trim(), name: name.trim() });
    setCode(''); setName(''); refresh();
  }
  async function del(c:string){ await removeSubject(c); refresh(); }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Nova matéria</h3>
        <form className="grid gap-3" onSubmit={add}>
          <div>
            <label className="label">Código</label>
            <input className="input" value={code} onChange={e=>setCode(e.target.value)} placeholder="MAT-101" required />
          </div>
          <div>
            <label className="label">Nome</label>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Matemática I" required />
          </div>
          <div><button className="btn">Adicionar</button></div>
        </form>
      </div>
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Matérias cadastradas</h3>
        <div className="grid gap-2">
          {list.map(s=>(
            <div key={s.code} className="border rounded-xl p-3 bg-white flex items-center justify-between">
              <div><div className="font-medium">{s.code}</div><div className="text-sm text-slate-600">{s.name}</div></div>
              <button className="btn ghost" onClick={()=>del(s.code)}>Excluir</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------- Painel de professores -------- */
function TeachersPanel() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [list, setList] = useState<Teacher[]>([]);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  async function refresh(){
    setList(await listTeachers());
    setSubjects(await listSubjects());
  }
  useEffect(()=>{ refresh(); },[]);

  async function add(e:React.FormEvent){
    e.preventDefault();
    await addTeacher(name.trim(), selected);
    setName(''); setSelected([]);
    refresh();
  }
  async function del(id:string){ await removeTeacher(id); refresh(); }

  function toggle(code:string){
    setSelected(prev=> prev.includes(code) ? prev.filter(c=>c!==code) : [...prev, code]);
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Novo professor</h3>
        <form className="grid gap-3" onSubmit={add}>
          <div>
            <label className="label">Nome</label>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Nome do professor" required />
          </div>
          <div>
            <label className="label">Matérias</label>
            <div className="grid grid-cols-2 gap-2">
              {subjects.map(s=>(
                <label key={s.code} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selected.includes(s.code)} onChange={()=>toggle(s.code)} />
                  <span>{s.code} — {s.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div><button className="btn">Adicionar</button></div>
        </form>
      </div>
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Professores</h3>
        <div className="grid gap-2">
          {list.map(t=>(
            <div key={t.id} className="border rounded-xl p-3 bg-white">
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-slate-600">{t.subjectCodes.join(', ') || 'Sem matérias'}</div>
              <div className="mt-2"><button className="btn ghost" onClick={()=>del(t.id)}>Excluir</button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------- Painel de alunos -------- */
function StudentsPanel() {
  const [list, setList] = useState<Student[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [classCode, setClassCode] = useState('');

  async function refresh(){ setList(await listStudents()); }
  useEffect(()=>{ refresh(); },[]);

  async function add(e:React.FormEvent){
    e.preventDefault();
    await addStudent({ name: name.trim(), email: email.trim() || undefined, classCode: classCode.trim() || undefined });
    setName(''); setEmail(''); setClassCode(''); refresh();
  }
  async function del(id:string){ await removeStudent(id); refresh(); }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Novo aluno</h3>
        <form className="grid gap-3" onSubmit={add}>
          <div>
            <label className="label">Nome</label>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} required placeholder="Nome do aluno" />
          </div>
          <div>
            <label className="label">Email (opcional)</label>
            <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@ex.com" />
          </div>
          <div>
            <label className="label">Turma (opcional)</label>
            <input className="input" value={classCode} onChange={e=>setClassCode(e.target.value)} placeholder="Ex.: 1A" />
          </div>
          <div><button className="btn">Adicionar</button></div>
        </form>
      </div>
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Alunos</h3>
        <div className="grid gap-2">
          {list.map(s=>(
            <div key={s.id} className="border rounded-xl p-3 bg-white flex items-center justify-between">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-slate-600">{[s.email, s.classCode].filter(Boolean).join(' · ') || '—'}</div>
              </div>
              <button className="btn ghost" onClick={()=>del(s.id)}>Excluir</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
