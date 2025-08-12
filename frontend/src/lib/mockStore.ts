// src/lib/mockStore.ts
import { Subject, Teacher, Student } from './types';

const KEY = 'ic_store_v1';

type Store = {
  subjects: Subject[];
  teachers: Teacher[];
  students: Student[];
};

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {}
  // seed inicial (só pra começar bonito)
  const seed: Store = {
    subjects: [
      { code: 'MAT-101', name: 'Matemática I' },
      { code: 'POR-101', name: 'Português I' },
      { code: 'HIS-101', name: 'História I' },
    ],
    teachers: [
      { id: 't-ana', name: 'Ana Souza', subjectCodes: ['MAT-101'] },
      { id: 't-joao', name: 'João Pereira', subjectCodes: ['POR-101'] },
    ],
    students: [
      { id: 's-001', name: 'Maria Lima', email: 'maria@ex.com', classCode: '1A' },
    ],
  };
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}

function save(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

// helpers
function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

// Subjects CRUD
export async function listSubjects(): Promise<Subject[]> {
  return load().subjects;
}
export async function addSubject(s: Subject): Promise<void> {
  const st = load();
  if (st.subjects.some(x => x.code === s.code)) throw new Error('Código já existe');
  st.subjects.push(s);
  save(st);
}
export async function removeSubject(code: string): Promise<void> {
  const st = load();
  st.subjects = st.subjects.filter(x => x.code !== code);
  // também remover dos teachers
  st.teachers = st.teachers.map(t => ({...t, subjectCodes: t.subjectCodes.filter(c => c !== code)}));
  save(st);
}

// Teachers CRUD
export async function listTeachers(): Promise<Teacher[]> {
  return load().teachers;
}
export async function addTeacher(name: string, subjectCodes: string[]): Promise<Teacher> {
  const st = load();
  const t: Teacher = { id: uid('t'), name, subjectCodes };
  st.teachers.push(t);
  save(st);
  return t;
}
export async function removeTeacher(id: string): Promise<void> {
  const st = load();
  st.teachers = st.teachers.filter(t => t.id !== id);
  save(st);
}

// Students CRUD
export async function listStudents(): Promise<Student[]> {
  return load().students;
}
export async function addStudent(data: Omit<Student,'id'>): Promise<Student> {
  const st = load();
  const s: Student = { id: uid('s'), ...data };
  st.students.push(s);
  save(st);
  return s;
}
export async function removeStudent(id: string): Promise<void> {
  const st = load();
  st.students = st.students.filter(s => s.id !== id);
  save(st);
}

// Utils para selects
export async function teacherOptionsForSubject(code?: string) {
  const [teachers] = await Promise.all([listTeachers()]);
  if (!code) return teachers;
  return teachers.filter(t => t.subjectCodes.includes(code));
}