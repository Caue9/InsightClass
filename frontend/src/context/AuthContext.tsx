import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Role = 'aluno' | 'professor' | 'gestor';
type Session = { username: string; role: Role } | null;

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
      if (raw) setSession(JSON.parse(raw));
    } catch {}
  }, []);

  const value = useMemo<AuthCtx>(() => ({
    session,
    async login(username, password, role) {
      // TODO: trocar pra /auth/login quando o backend existir
      if (!username || !password || !role) throw new Error('Preencha tudo.');
      const sess = { username, role };
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
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}