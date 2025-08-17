// src/pages/Professor.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { listTeachers, listSubjects, listStudents, addFeedback, listFeedbacks } from '../lib/mockStore';
import type { Teacher, Subject, Student, Feedback, FeedbackLabel } from '../lib/types';

export default function Professor() {
  const { session, logout } = useAuth();
  const [professorData, setProfessorData] = useState<Teacher | null>(null);
  const [taughtSubjects, setTaughtSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [feedbacksAboutMeOrSubjects, setFeedbacksAboutMeOrSubjects] = useState<Feedback[]>([]);
  const [mySentFeedbacks, setMySentFeedbacks] = useState<Feedback[]>([]);
  const [feedbackForm, setFeedbackForm] = useState({
    studentId: '',
    text: '',
    isAnonymous: false, // Professor não tem essa opção, sempre false
    label: '' as FeedbackLabel,
  });
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'enviar' | 'recebidos' | 'enviados'>('enviar');

  const currentProfessorId = session?.id;

  useEffect(() => {
    async function loadProfessorData() {
      if (session?.role === 'professor' && session.username && session.id) {
        try {
          const allTeachers = await listTeachers();
          const currentTeacher = allTeachers.find(t => t.id === session.id);

          if (currentTeacher) {
            setProfessorData(currentTeacher);

            const allSubjects = await listSubjects();
            const subjectsThisTeacherTeaches = allSubjects.filter(subject =>
              currentTeacher.subjectCodes.includes(subject.code)
            );
            setTaughtSubjects(subjectsThisTeacherTeaches);
            setStudents(await listStudents());

            const feedbacks = await listFeedbacks();
            const feedbacksForMeOrMySubjects: Feedback[] = [];
            const feedbacksSentByMe: Feedback[] = [];

            feedbacks.forEach(f => {
              if (f.author_id === currentTeacher.id && f.author_role === 'professor') {
                feedbacksSentByMe.push(f);
              }
              if (f.target_type === 'professor' && f.target_id === currentTeacher.id) {
                feedbacksForMeOrMySubjects.push(f);
              }
              if (f.target_type === 'materia' && currentTeacher.subjectCodes.includes(f.target_id || '')) {
                feedbacksForMeOrMySubjects.push(f);
              }
            });
            setFeedbacksAboutMeOrSubjects(feedbacksForMeOrMySubjects);
            setMySentFeedbacks(feedbacksSentByMe);

          } else {
            console.warn("Dados do professor não encontrados para a sessão atual (ID pode estar desatualizado).");
          }
        } catch (error) {
          console.error("Erro ao carregar dados do professor:", error);
          setFeedbackStatus("Erro ao carregar dados.");
        }
      }
    }
    loadProfessorData();
  }, [session, activeTab]);

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackStatus('Enviando feedback...');
    if (!currentProfessorId || !professorData) {
        setFeedbackStatus('Erro: Dados do professor não disponíveis.');
        return;
    }
    if (!feedbackForm.studentId || !feedbackForm.text) {
        setFeedbackStatus('Por favor, selecione um aluno e escreva seu feedback.');
        return;
    }

    try {
      const selectedStudent = students.find(s => s.id === feedbackForm.studentId);

      await addFeedback({
        author_id: currentProfessorId,
        author_role: 'professor',
        text: feedbackForm.text,
        target_type: 'aluno',
        target_id: feedbackForm.studentId,
        target_name: selectedStudent?.name,
        is_anonymous: false, // Professor NÃO pode enviar feedback anônimo
        label: feedbackForm.label || 'neutro',
      });
      setFeedbackStatus('Feedback enviado com sucesso!');
      setFeedbackForm({ studentId: '', text: '', isAnonymous: false, label: '' as FeedbackLabel });
      setMySentFeedbacks(await listFeedbacks({ author_id: currentProfessorId, author_role: 'professor' }));
    } catch (error: any) {
      setFeedbackStatus(`Erro ao enviar feedback: ${error.message}`);
      console.error(error);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header current="professor" onLogout={logout} />
      <main className="max-w-5xl mx-auto px-4 py-8 grid gap-6">
        <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900">
            Bem-vindo, Professor {professorData?.name || session?.username}! 👋
          </h2>
          <nav className="flex gap-1">
            <button
              className={`px-3 py-2 rounded-xl text-sm font-medium ${activeTab === 'enviar' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              onClick={() => setActiveTab('enviar')}
            >
              Enviar Feedback
            </button>
            <button
              className={`px-3 py-2 rounded-xl text-sm font-medium ${activeTab === 'recebidos' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              onClick={() => setActiveTab('recebidos')}
            >
              Feedbacks para Mim
            </button>
            <button
              className={`px-3 py-2 rounded-xl text-sm font-medium ${activeTab === 'enviados' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              onClick={() => setActiveTab('enviados')}
            >
              Meus Enviados
            </button>
          </nav>
        </div>

        {activeTab === 'enviar' && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3">Enviar Feedback sobre um Aluno</h3>
            <form onSubmit={handleSendFeedback} className="grid gap-4">
              <div>
                <label className="label">Aluno:</label>
                <select
                  className="input"
                  value={feedbackForm.studentId}
                  onChange={e => setFeedbackForm({ ...feedbackForm, studentId: e.target.value })}
                  required
                >
                  <option value="">Selecione um aluno</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name} ({student.classCode})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Seu Feedback:</label>
                <textarea
                  className="input h-24"
                  value={feedbackForm.text}
                  onChange={e => setFeedbackForm({ ...feedbackForm, text: e.target.value })}
                  placeholder="Escreva seu feedback sobre o aluno aqui..."
                  required
                ></textarea>
              </div>
              {/* O professor não tem a opção de ser anônimo */}
              <input type="hidden" name="isAnonymous" value="false" />
              <div>
                <label className="label">Classificação:</label>
                <div className="flex gap-4 mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-green-500"
                      name="feedbackLabel"
                      value="positivo"
                      checked={feedbackForm.label === 'positivo'}
                      onChange={e => setFeedbackForm({ ...feedbackForm, label: e.target.value as FeedbackLabel })}
                    />
                    <span className="ml-2 text-green-700">Positivo 😊</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-yellow-500"
                      name="feedbackLabel"
                      value="neutro"
                      checked={feedbackForm.label === 'neutro'}
                      onChange={e => setFeedbackForm({ ...feedbackForm, label: e.target.value as FeedbackLabel })}
                    />
                    <span className="ml-2 text-yellow-700">Neutro 😐</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-red-500"
                      name="feedbackLabel"
                      value="negativo"
                      checked={feedbackForm.label === 'negativo'}
                      onChange={e => setFeedbackForm({ ...feedbackForm, label: e.target.value as FeedbackLabel })}
                    />
                    <span className="ml-2 text-red-700">Negativo 😠</span>
                  </label>
                </div>
              </div>
              <button type="submit" className="btn w-full">Enviar Feedback</button>
            </form>
            {feedbackStatus && <p className="text-sm mt-2 text-slate-600">{feedbackStatus}</p>}
          </div>
        )}

        {activeTab === 'recebidos' && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3">Feedbacks Para Mim ou Minhas Matérias</h3>
            {feedbacksAboutMeOrSubjects.length === 0 ? (
              <p className="text-sm text-slate-600">Nenhum feedback recebido ainda.</p>
            ) : (
              <div className="grid gap-4">
                {feedbacksAboutMeOrSubjects.map(f => (
                  <FeedbackCard key={f.id} feedback={f} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'enviados' && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3">Meus Feedbacks Enviados</h3>
            {mySentFeedbacks.length === 0 ? (
              <p className="text-sm text-slate-600">Você não enviou nenhum feedback ainda.</p>
            ) : (
              <div className="grid gap-4">
                {mySentFeedbacks.map(f => (
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

// Componente auxiliar para exibir um feedback
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