// src/pages/Gestor.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { SubjectsPanel } from '../components/gestor/SubjectsPanel';
import { TeachersPanel } from '../components/gestor/TeachersPanel';
import { StudentsPanel } from '../components/gestor/StudentsPanel';
import { listFeedbacks, listStudents, listTeachers, listSubjects } from '../lib/mockStore';
import type { Feedback, AppRole, TargetType, Student, Teacher, Subject, FeedbackLabel } from '../lib/types';

// Componente auxiliar para exibir um feedback (pode ser o mesmo do Aluno.tsx/Professor.tsx)
function FeedbackCard({ feedback }: { feedback: Feedback }) {
  const getLabelColor = (label?: FeedbackLabel) => {
    switch (label) {
      case 'positivo': return 'text-green-700 bg-green-50';
      case 'neutro': return 'text-yellow-700 bg-yellow-50';
      case 'negativo': return 'text-red-700 bg-red-50';
      default: return 'text-slate-700 bg-slate-50';
    }
  };

  const getTargetText = (f: Feedback) => {
    switch (f.target_type) {
      case 'professor': return `Para Professor: ${f.target_name || 'Desconhecido'}`;
      case 'aluno': return `Para Aluno: ${f.target_name || 'Desconhecido'}`;
      case 'turma': return `Para Turma: ${f.target_name || 'Desconhecido'}`;
      case 'materia': return `Para Matéria: ${f.target_name || 'Desconhecido'}`;
      case 'coordenacao': return 'Para Coordenação';
      default: return '';
    }
  }

  return (
    <div className={`p-4 border rounded-lg shadow-sm ${getLabelColor(feedback.label)}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-slate-800">
          {feedback.is_anonymous
            ? 'Anônimo'
            : `De ${feedback.author_name || feedback.author_role === 'aluno' ? 'Aluno' : feedback.author_role === 'professor' ? 'Professor' : 'Gestor'}`
          }
        </span>
        <span className="text-xs text-slate-500">
          {new Date(feedback.submitted_at).toLocaleDateString()}
        </span>
      </div>
      <p className="text-slate-800 text-sm mb-2">{feedback.text}</p>
      <div className="text-xs text-slate-600 italic">
        {getTargetText(feedback)}
      </div>
    </div>
  );
}


export default function Gestor() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'materias' | 'professores' | 'alunos' | 'feedbacks'>('materias');

  // Estados para feedbacks do gestor
  const [allFeedbacks, setAllFeedbacks] = useState<Feedback[]>([]);
  const [filterAuthorRole, setFilterAuthorRole] = useState<AppRole | ''>('');
  const [filterTargetType, setFilterTargetType] = useState<TargetType | ''>('');
  const [filterTargetId, setFilterTargetId] = useState<string>('');

  // Para preencher os selects de filtro
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [allClassCodes, setAllClassCodes] = useState<string[]>([]);


  useEffect(() => {
    async function loadFeedbacksAndFilterOptions() {
      try {
        const students = await listStudents();
        const teachers = await listTeachers();
        const subjects = await listSubjects();

        setAllStudents(students);
        setAllTeachers(teachers);
        setAllSubjects(subjects);
        setAllClassCodes(Array.from(new Set(students.map(s => s.classCode)))); // Turmas únicas

        // Carrega feedbacks com base nos filtros
        const params: any = {};
        if (filterAuthorRole) params.author_role = filterAuthorRole;
        if (filterTargetType) params.target_type = filterTargetType;

        if (filterTargetId) {
            params.target_id = filterTargetId;
        }

        const feedbacks = await listFeedbacks(params);
        setAllFeedbacks(feedbacks);

      } catch (error) {
        console.error("Erro ao carregar feedbacks ou opções de filtro:", error);
      }
    }

    if (activeTab === 'feedbacks') {
      loadFeedbacksAndFilterOptions();
    }
  }, [activeTab, filterAuthorRole, filterTargetType, filterTargetId]);


  // Função para mapear o target_id para o nome do alvo (para filtros)
  const getTargetOptions = () => {
    switch (filterTargetType) {
      case 'aluno': return allStudents.map(s => ({ id: s.id, name: `${s.name} (${s.classCode})` }));
      case 'professor': return allTeachers.map(t => ({ id: t.id, name: t.name }));
      case 'materia': return allSubjects.map(s => ({ id: s.code, name: `${s.name} (${s.code})` }));
      case 'turma': return allClassCodes.map(code => ({ id: code, name: code }));
      default: return [];
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header current="gestor" onLogout={logout} />
      <main className="max-w-5xl mx-auto px-4 py-8 grid gap-6">
        <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900">Painel do Gestor</h2>
          <nav className="flex gap-1">
            <button
              className={`px-3 py-2 rounded-xl text-sm font-medium ${activeTab === 'materias' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              onClick={() => setActiveTab('materias')}
            >
              Matérias
            </button>
            <button
              className={`px-3 py-2 rounded-xl text-sm font-medium ${activeTab === 'professores' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              onClick={() => setActiveTab('professores')}
            >
              Professores
            </button>
            <button
              className={`px-3 py-2 rounded-xl text-sm font-medium ${activeTab === 'alunos' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              onClick={() => setActiveTab('alunos')}
            >
              Alunos
            </button>
            <button
              className={`px-3 py-2 rounded-xl text-sm font-medium ${activeTab === 'feedbacks' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              onClick={() => setActiveTab('feedbacks')}
            >
              Feedbacks
            </button>
          </nav>
        </div>

        {activeTab === 'materias' && <SubjectsPanel />}
        {activeTab === 'professores' && <TeachersPanel />}
        {activeTab === 'alunos' && <StudentsPanel />}

        {activeTab === 'feedbacks' && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3">Visualizar Feedbacks</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="label">Filtrar por Autor:</label>
                <select
                  className="input"
                  value={filterAuthorRole}
                  onChange={e => {
                    setFilterAuthorRole(e.target.value as AppRole | '');
                    setFilterTargetId(''); // Limpa alvo ao mudar tipo de autor
                  }}
                >
                  <option value="">Todos</option>
                  <option value="aluno">Aluno</option>
                  <option value="professor">Professor</option>
                  <option value="gestor">Gestor</option>
                </select>
              </div>
              <div>
                <label className="label">Filtrar por Tipo de Alvo:</label>
                <select
                  className="input"
                  value={filterTargetType}
                  onChange={e => {
                    setFilterTargetType(e.target.value as TargetType | '');
                    setFilterTargetId(''); // Limpa alvo ao mudar tipo de alvo
                  }}
                >
                  <option value="">Todos</option>
                  <option value="professor">Professor</option>
                  <option value="aluno">Aluno</option>
                  <option value="turma">Turma</option>
                  <option value="materia">Matéria</option>
                  <option value="coordenacao">Coordenação</option>
                </select>
              </div>
              {filterTargetType && filterTargetType !== 'coordenacao' && (
                <div>
                  <label className="label">Filtrar por Alvo Específico:</label>
                  <select
                    className="input"
                    value={filterTargetId}
                    onChange={e => setFilterTargetId(e.target.value)}
                  >
                    <option value="">Todos</option>
                    {getTargetOptions().map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {allFeedbacks.length === 0 ? (
              <p className="text-sm text-slate-600 mt-4">Nenhum feedback encontrado com os filtros aplicados.</p>
            ) : (
              <div className="grid gap-4 mt-4">
                {allFeedbacks.map(f => (
                  <FeedbackCard key={f.id} feedback={f} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}