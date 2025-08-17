import { useEffect, useMemo, useState } from 'react';
import { listarFeedbacks, type FeedbackItem, type SentLabel } from '../lib/api';

export default function FeedbacksPanel() {
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
          <input className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="MAT-101" value={course} onChange={e=>setCourse(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-slate-600">Papel</label>
          <select className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-slate-400" value={role} onChange={e=>setRole(e.target.value as any)}>
            <option value="">Todos</option>
            <option value="aluno">Aluno</option>
            <option value="professor">Professor</option>
            <option value="gestor">Gestor</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-600">Limite</label>
          <input className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-slate-400" type="number" min={1} max={500} value={limit} onChange={e=>setLimit(Number(e.target.value||50))}/>
        </div>
        <div className="flex items-end">
          <button className="px-4 py-2 rounded-xl text-white font-medium bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed" onClick={load} disabled={loading}>{loading?'Carregando…':'Carregar'}</button>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">Total: {items.length}</span>
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">Positivo: {kpi.positivo}</span>
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-sky-100 text-sky-700">Neutro: {kpi.neutro}</span>
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-700">Negativo: {kpi.negativo}</span>
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