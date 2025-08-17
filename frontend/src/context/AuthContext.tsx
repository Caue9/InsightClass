// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { findUserCredential, listStudents, listTeachers } from '../lib/mockStore';
import { UserCredential, Student, Teacher } from '../lib/types';

export type Role = 'aluno' | 'professor' | 'gestor';

type Session = {
  id?: string; // Adicionado: ID do usuário logado
  username?: string;
  role?: Role;
  classCode?: string; // Para alunos
  subjectCodes?: string[]; // Para professores
} | null;

type AuthCtx = {
  session: Session;
  login: (u: string, p: string, role: Role) => Promise<void>;
  logout: () => void;
};

const KEY = 'ic_session_v1';
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsedSession: Session = JSON.parse(raw);
        if (parsedSession && parsedSession.username && parsedSession.role && parsedSession.id) {
          setSession(parsedSession);
        } else {
          localStorage.removeItem(KEY);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar sessão do localStorage:", error);
      localStorage.removeItem(KEY);
    }
  }, []);

  const value = useMemo<AuthCtx>(() => ({
    session,
    async login(username, password, role) {
      if (!username || !password || !role) {
        throw new Error('Preencha todos os campos para fazer login.');
      }

      const user = await findUserCredential(username, password);

      if (!user) {
        throw new Error('Usuário ou senha inválidos.');
      }
      if (user.role !== role) {
        throw new Error(`Credenciais válidas, mas a função selecionada não corresponde ao usuário.`);
      }

      let sess: Session = { username: user.username, role: user.role };

      if (user.role === 'aluno') {
        const allStudents = await listStudents();
        const student = allStudents.find(s => s.email === user.username);
        if (student) {
          sess = { ...sess, id: student.id, classCode: student.classCode };
        }
      } else if (user.role === 'professor') {
        const allTeachers = await listTeachers();
        const teacher = allTeachers.find(t => t.email === user.username);
        if (teacher) {
          sess = { ...sess, id: teacher.id, subjectCodes: teacher.subjectCodes };
        }
      } else if (user.role === 'gestor') {
         sess = { ...sess, id: 'gestor-root' }; // ID fixo para o gestor
      }

      localStorage.setItem(KEY, JSON.stringify(sess));
      setSession(sess);
    },
    logout() {
      localStorage.removeItem(KEY);
      setSession(null);
    },
  }), [session]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return ctx;
}