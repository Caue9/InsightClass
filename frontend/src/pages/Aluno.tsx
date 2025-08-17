// src/pages/Aluno.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { listTeachers, addFeedback, listFeedbacks, listStudents } from '../lib/mockStore';
import type { Teacher, Feedback, FeedbackLabel } from '../lib/types';

export default function Aluno() {
  const { session, logout } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [feedbacksAboutMe, setFeedbacksAboutMe] = useState<Feedback[]>([]);
  const [mySentFeedbacks, setMySentFeedbacks] = useState<Feedback[]>([]);
  const [feedbackForm, setFeedbackForm] = useState({
    teacherId: '',
    text: '',
    isAnonymous: false,
    label: '' as FeedbackLabel,
  });
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'enviar' | 'recebidos' | 'enviados'>('enviar');

  // currentStudentId agora vem diretamente da sessão (AuthContext)
  const currentStudentId = session?.id;

  useEffect(() => {
    async function loadData() {
      try {
        setTeachers(await listTeachers());

        // A propriedade `session.id` agora deve estar disponível após o login
        if (session?.role === 'aluno' && session.id) {
          // Feedbacks recebidos (sobre este aluno)
          setFeedbacksAboutMe(await listFeedbacks({ target_id: session.id, target_type: 'aluno' }));
          // Feedbacks enviados por este aluno
          setMySentFeedbacks(await listFeedbacks({ author_id: session.id, author_role: 'aluno' }));
        }

      } catch (error) {
        console.error("Erro ao carregar dados na página do aluno:", error);
        setFeedbackStatus("Erro ao carregar dados.");
      }
    }
    loadData();
  }, [session, activeTab]); // Recarrega dados ao mudar de aba ou sessão

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackStatus('Enviando feedback...');
    if (!currentStudentId) { // Usa a variável local já validada
        setFeedbackStatus('Erro: ID do aluno não disponível na sessão. Por favor, faça login novamente.');
        return;
    }
    if (!feedbackForm.teacherId || !feedbackForm.text) {
        setFeedbackStatus('Por favor, selecione um professor e escreva seu feedback.');
        return;
    }

    try {
      const selectedTeacher = teachers.find(t => t.id === feedbackForm.teacherId);

      await addFeedback({
        author_id: currentStudentId, // Usa a variável local já validada
        author_role: 'aluno',
        text: feedbackForm.text,
        target_type: 'professor',
        target_id: feedbackForm.teacherId,
        target_name: selectedTeacher?.name,
        is_anonymous: feedbackForm.isAnonymous,
        label: feedbackForm.label || 'neutro',
      });
      setFeedbackStatus('Feedback enviado com sucesso!');
      setFeedbackForm({ teacherId: '', text: '', isAnonymous: false, label: '' as FeedbackLabel });
      // Recarrega os feedbacks enviados após o envio
      setMySentFeedbacks(await listFeedbacks({ author_id: currentStudentId, author_role: 'aluno' }));
    } catch (error: any) {
      setFeedbackStatus(`Erro ao enviar feedback: ${error.message}`);
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header current="aluno" onLogout={logout} />
      <main className="max-w-5xl mx-auto px-4 py-8 grid gap-6">
        <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900">
            Bem-vindo, {session?.username || 'Aluno'}! 👋
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
              Meus Recebidos
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
            <h3 className="text-lg font-semibold mb-3">Enviar Feedback para um Professor</h3>
            <form onSubmit={handleSendFeedback} className="grid gap-4">
              <div>
                <label className="label">Professor:</label>
                <select
                  className="input"
                  value={feedbackForm.teacherId}
                  onChange={e => setFeedbackForm({ ...feedbackForm, teacherId: e.target.value })}
                  required
                >
                  <option value="">Selecione um professor</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Seu Feedback:</label>
                <textarea
                  className="input h-24"
                  value={feedbackForm.text}
                  onChange={e => setFeedbackForm({ ...feedbackForm, text: e.target.value })}
                  placeholder="Escreva seu feedback aqui..."
                  required
                ></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymousFeedback"
                  checked={feedbackForm.isAnonymous}
                  onChange={e => setFeedbackForm({ ...feedbackForm, isAnonymous: e.target.checked })}
                  className="form-checkbox h-4 w-4 text-slate-600 transition duration-150 ease-in-out"
                />
                <label htmlFor="anonymousFeedback" className="text-sm text-slate-700">Enviar como Anônimo</label>
              </div>
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
            <h3 className="text-lg font-semibold mb-3">Feedbacks Sobre Mim</h3>
            {feedbacksAboutMe.length === 0 ? (
              <p className="text-sm text-slate-600">Nenhum feedback recebido ainda.</p>
            ) : (
              <div className="grid gap-4">
                {feedbacksAboutMe.map(f => (
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
          {feedback.is_anonymous ? 'Anônimo' : `De ${feedback.author_role === 'aluno' ? 'Aluno' : feedback.author_role === 'professor' ? 'Professor' : 'Gestor'}`}
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