// src/lib/mockStore.ts
import { Subject, Teacher, Student, UserCredential, Feedback, AppRole } from './types';

const KEY = 'ic_store_v1';

type Store = {
  subjects: Subject[];
  teachers: Teacher[];
  students: Student[];
  users: UserCredential[];
  feedbacks: Feedback[]; // Adiciona uma lista de feedbacks
};

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Store;

      const teachersWithEmail = parsed.teachers?.map(t => ({
        ...t,
        email: t.email || `placeholder@${t.id}.com`
      })) || [];

      return {
        subjects: parsed.subjects || [],
        teachers: teachersWithEmail,
        students: parsed.students || [],
        users: parsed.users || [],
        feedbacks: parsed.feedbacks || [],
      };
    }
  } catch (error) {
    console.error("Erro ao carregar do localStorage, usando seed inicial:", error);
  }

  // --- Seed inicial de dados ---
  const seed: Store = {
    subjects: [
      { code: 'MAT-101', name: 'Matemática I' },
      { code: 'POR-101', name: 'Português I' },
      { code: 'HIS-101', name: 'História I' },
      { code: 'GEO-101', name: 'Geografia I' },
    ],
    teachers: [
      { id: 't-ana', name: 'Ana Souza', email: 'ana@ex.com', subjectCodes: ['MAT-101', 'GEO-101'] },
      { id: 't-joao', name: 'João Pereira', email: 'joao@ex.com', subjectCodes: ['POR-101'] },
    ],
    students: [
      { id: 's-001', name: 'Maria Lima', email: 'maria@ex.com', classCode: '1A' },
      { id: 's-002', name: 'Carlos Santos', email: 'carlos@ex.com', classCode: '1A' },
      { id: 's-003', name: 'Fernanda Rocha', email: 'fernanda@ex.com', classCode: '2B' },
    ],
    users: [
      { username: 'gestor@ex.com', password: '123', role: 'gestor' },
      { username: 'ana@ex.com', password: '123', role: 'professor' },
      { username: 'joao@ex.com', password: '123', role: 'professor' },
      { username: 'maria@ex.com', password: '123', role: 'aluno' },
      { username: 'carlos@ex.com', password: '123', role: 'aluno' },
      { username: 'fernanda@ex.com', password: '123', role: 'aluno' },
    ],
    feedbacks: [
      // Exemplo de feedback inicial (Aluno para Professor)
      {
        id: uid('f'),
        author_id: 's-001', // Maria Lima
        author_role: 'aluno',
        author_name: 'Maria Lima', // Nome do autor
        text: 'A professora Ana é muito didática e paciente! Adorei a aula de matemática.',
        target_type: 'professor',
        target_id: 't-ana',
        target_name: 'Ana Souza',
        is_anonymous: false,
        label: 'positivo',
        submitted_at: new Date(2025, 6, 15, 10, 0).toISOString(), // Mês 6 = Julho
      },
      {
        id: uid('f'),
        author_id: 's-002', // Carlos Santos
        author_role: 'aluno',
        author_name: undefined, // Anônimo
        text: 'As aulas de Português do professor João poderiam ser mais interativas.',
        target_type: 'professor',
        target_id: 't-joao',
        target_name: 'João Pereira',
        is_anonymous: true,
        label: 'neutro',
        submitted_at: new Date(2025, 6, 16, 11, 30).toISOString(),
      },
      // Exemplo de feedback Professor para Aluno
      {
        id: uid('f'),
        author_id: 't-ana', // Ana Souza
        author_role: 'professor',
        author_name: 'Ana Souza',
        text: 'Maria Lima é uma aluna muito dedicada e participativa.',
        target_type: 'aluno',
        target_id: 's-001',
        target_name: 'Maria Lima',
        is_anonymous: false,
        label: 'positivo',
        submitted_at: new Date(2025, 6, 17, 9, 0).toISOString(),
      },
       // Exemplo de feedback Gestor para Turma
      {
        id: uid('f'),
        author_id: 'gestor-root',
        author_role: 'gestor',
        author_name: 'Gestor Geral',
        text: 'A turma 1A demonstrou excelente desempenho no último simulado.',
        target_type: 'turma',
        target_id: '1A',
        target_name: '1A',
        is_anonymous: false,
        label: 'positivo',
        submitted_at: new Date(2025, 6, 18, 14, 0).toISOString(),
      },
       {
        id: uid('f'),
        author_id: 's-001', // Maria Lima
        author_role: 'aluno',
        author_name: 'Maria Lima',
        text: 'Sugiro mais exercícios práticos em Geografia.',
        target_type: 'materia',
        target_id: 'GEO-101',
        target_name: 'Geografia I',
        is_anonymous: false,
        label: 'neutro',
        submitted_at: new Date(2025, 6, 19, 10, 0).toISOString(),
      },
    ],
  };
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}

function save(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

// Supondo que você já tenha funções como listStudents, listTeachers, findUserCredential
// Funções auxiliares para buscar nome por ID
async function getUserNameById(id: string, role: AppRole): Promise<string | undefined> {
    const st = load();
    if (role === 'aluno') {
        return st.students.find(s => s.id === id)?.name;
    }
    if (role === 'professor') {
        return st.teachers.find(t => t.id === id)?.name;
    }
    if (role === 'gestor' && id === 'gestor-root') {
        return 'Gestor Geral';
    }
    return undefined;
}


// Subjects CRUD (sem alterações)
export async function listSubjects(): Promise<Subject[]> {
  return load().subjects;
}
export async function addSubject(s: Subject): Promise<void> {
  const st = load();
  if (st.subjects.some(x => x.code === s.code)) throw new Error('Código da matéria já existe.');
  st.subjects.push(s);
  save(st);
}
export async function removeSubject(code: string): Promise<void> {
  const st = load();
  const initialSubjectsCount = st.subjects.length;
  st.subjects = st.subjects.filter(x => x.code !== code);

  if (st.subjects.length === initialSubjectsCount) {
    return;
  }

  st.teachers = st.teachers.map(t => ({ ...t, subjectCodes: t.subjectCodes.filter(c => c !== code) }));
  st.feedbacks = st.feedbacks.filter(f => !(f.target_type === 'materia' && f.target_id === code));
  save(st);
}

// Teachers CRUD (sem alterações substanciais além do seed)
export async function listTeachers(): Promise<Teacher[]> {
  return load().teachers;
}
export async function addTeacher(name: string, subjectCodes: string[], email: string, password_hash: string): Promise<Teacher> {
  const st = load();
  const invalidSubjects = subjectCodes.filter(code => !st.subjects.some(s => s.code === code));
  if (invalidSubjects.length > 0) {
    throw new Error(`Matérias não encontradas: ${invalidSubjects.join(', ')}`);
  }
  if (st.users.some(u => u.username === email)) {
    throw new Error('Email já cadastrado como usuário.');
  }

  const t: Teacher = { id: uid('t'), name, email, subjectCodes };
  st.teachers.push(t);
  st.users.push({ username: email, password: password_hash, role: 'professor' });
  save(st);
  return t;
}
export async function removeTeacher(id: string): Promise<void> {
  const st = load();
  const teacherToRemove = st.teachers.find(t => t.id === id);
  if (!teacherToRemove) return;

  st.teachers = st.teachers.filter(t => t.id !== id);
  st.users = st.users.filter(u => u.username !== teacherToRemove.email);
  st.feedbacks = st.feedbacks.filter(f => !(f.author_id === id && f.author_role === 'professor') && !(f.target_type === 'professor' && f.target_id === id));
  save(st);
}

// Students CRUD (sem alterações substanciais além do seed)
export async function listStudents(): Promise<Student[]> {
  return load().students;
}
export async function addStudent(data: Omit<Student, 'id'> & { email: string, password_hash: string }): Promise<Student> {
  const st = load();
  if (data.email && st.students.some(s => s.email === data.email)) {
    throw new Error('Email já cadastrado para outro aluno.');
  }
  if (st.users.some(u => u.username === data.email)) {
    throw new Error('Email já cadastrado como usuário.');
  }

  const s: Student = { id: uid('s'), ...data };
  st.students.push(s);
  st.users.push({ username: data.email, password: data.password_hash, role: 'aluno' });
  save(st);
  return s;
}
export async function removeStudent(id: string): Promise<void> {
  const st = load();
  const studentToRemove = st.students.find(s => s.id === id);
  if (!studentToRemove) return;

  st.students = st.students.filter(s => s.id !== id);
  st.users = st.users.filter(u => u.username !== studentToRemove.email);
  st.feedbacks = st.feedbacks.filter(f => !(f.author_id === id && f.author_role === 'aluno') && !(f.target_type === 'aluno' && f.target_id === id));
  save(st);
}

// Utils para selects (sem alterações)
export async function teacherOptionsForSubject(code?: string): Promise<Teacher[]> {
  const teachers = await listTeachers();
  if (!code) return teachers;
  return teachers.filter(t => t.subjectCodes.includes(code));
}

// Autenticação (sem alterações)
export async function findUserCredential(username: string, password_hash: string): Promise<UserCredential | undefined> {
  const st = load();
  return st.users.find(u => u.username === username && u.password === password_hash);
}

// --- Funções de Feedback ---
export async function addFeedback(feedback: Omit<Feedback, 'id' | 'submitted_at' | 'author_name'>): Promise<Feedback> {
  const st = load();

  // Buscar o nome do autor se o feedback não for anônimo
  let authorName: string | undefined;
  if (!feedback.is_anonymous) {
      authorName = await getUserNameById(feedback.author_id, feedback.author_role);
  }

  const newFeedback: Feedback = {
    ...feedback,
    id: uid('f'),
    submitted_at: new Date().toISOString(),
    author_name: authorName, // Adiciona o nome do autor se disponível e não for anônimo
  };
  st.feedbacks.push(newFeedback);
  save(st);
  return newFeedback;
}

type ListFeedbacksParams = {
  author_id?: string;
  author_role?: AppRole;
  target_id?: string;
  target_type?: 'professor' | 'aluno' | 'turma' | 'materia' | 'coordenacao';
  limit?: number;
};

export async function listFeedbacks(params: ListFeedbacksParams = {}): Promise<Feedback[]> {
  const st = load();
  let filteredFeedbacks = st.feedbacks;

  if (params.author_id) {
    filteredFeedbacks = filteredFeedbacks.filter(f => f.author_id === params.author_id);
  }
  if (params.author_role) {
    filteredFeedbacks = filteredFeedbacks.filter(f => f.author_role === params.author_role);
  }
  if (params.target_id) {
    filteredFeedbacks = filteredFeedbacks.filter(f => f.target_id === params.target_id);
  }
  if (params.target_type) {
    filteredFeedbacks = filteredFeedbacks.filter(f => f.target_type === params.target_type);
  }

  filteredFeedbacks.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

  if (params.limit) {
    return filteredFeedbacks.slice(0, params.limit);
  }

  return filteredFeedbacks;
}