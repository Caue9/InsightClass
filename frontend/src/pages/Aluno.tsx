// src/pages/Aluno.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enviarFeedback, type Target } from '../lib/api';
import { listSubjects, teacherOptionsForSubject } from '../lib/mockStore';
import type { Subject } from '../lib/types';

type TeacherOpt = { id: string; name: string };

export default function Aluno() {
  const { session, logout } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<TeacherOpt[]>([]);

  const [form, setForm] = useState<{
    texto: string;
    target_type: Target;
    course_code: string;  // subject code
    teacher_id: string;
  }>({
    texto: '',
    target_type: 'professor',
    course_code: '',
    teacher_id: '',
  });
  const [status, setStatus] = useState('');

  // carrega matérias
  useEffect(() => {
    listSubjects().then(setSubjects);
  }, []);

  // quando muda a matéria, recarrega os professores
  useEffect(() => {
    (async () => {
      const list = await teacherOptionsForSubject(form.course_code);
      setTeachers(list.map(t => ({ id: t.id, name: t.name })));
      // se o teacher atual não dá match com a matéria, limpa
      if (form.teacher_id && !list.some(t => t.id === form.teacher_id)) {
        setForm(prev => ({ ...prev, teacher_id: '' }));
      }
    })();
  }, [form.course_code]);

  const canSubmit = useMemo(
    () => form.texto.trim().length > 0 && !!form.course_code && !!form.teacher_id,
    [form]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Enviando…');
    try {
      const role = session?.role ?? 'aluno';
      await enviarFeedback({
        texto: form.texto,
        author_role: role,
        target_type: 'professor',
        course_code: form.course_code,
        teacher_id: form.teacher_id,
      });
      setStatus('Enviado!');
      setForm(prev => ({ ...prev, texto: '' }));
    } catch {
      setStatus('Erro ao enviar. Verifique a API.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      <Header current="aluno" onLogout={logout} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Enviar Feedback</h2>

          <form className="grid gap-4" onSubmit={onSubmit}>
            <div>
              <label className="text-sm text-slate-600">Sobre qual matéria?</label>
              <select
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-slate-400"
                value={form.course_code}
                onChange={(e) => setForm({ ...form, course_code: e.target.value })}
                required
              >
                <option value="">Selecione…</option>
                {subjects.map(s => <option key={s.code} value={s.code}>{s.code} — {s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-600">Sobre qual professor?</label>
              <select
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-slate-400"
                value={form.teacher_id}
                onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                required
              >
                <option value="">Selecione…</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-600">Seu feedback</label>
              <textarea
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[120px]"
                placeholder="Conte como foi a aula…"
                value={form.texto}
                onChange={(e) => setForm({ ...form, texto: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-xl text-white font-medium bg-slate-900 hover:bg-slate-800" disabled={!canSubmit}>
                Enviar
              </button>
              {status && <span className="text-sm text-slate-600">{status}</span>}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function Header({
  current,
  onLogout,
}: {
  current: 'aluno' | 'professor' | 'gestor';
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-slate-900 text-white grid place-items-center text-sm font-bold">
            IC
          </div>
          <h1 className="font-semibold">InsightClass</h1>
        </div>
        <nav className="flex gap-1">
          <Tab to="/aluno" label="Aluno" active={current === 'aluno'} />
          <Tab to="/professor" label="Professor" active={current === 'professor'} />
          <Tab to="/gestor" label="Gestor" active={current === 'gestor'} />
          <button
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100"
            onClick={onLogout}
          >
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}

function Tab({ to, label, active }: { to: string; label: string; active?: boolean }) {
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
        active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      {label}
    </Link>
  );
}