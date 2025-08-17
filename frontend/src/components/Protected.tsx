// src/components/Protected.tsx
import { Navigate } from 'react-router-dom';
import { useAuth, Role } from '../context/AuthContext'; // Certifique-se que Role é importado

export function Protected({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow: Role[];
}) {
  const { session } = useAuth();

  // Verifica se a sessão existe E se as propriedades essenciais (username e role) existem nela.
  // Se qualquer uma delas não existir ou for indefinida, redireciona para o login.
  if (!session || !session.username || !session.role) {
    return <Navigate to="/login" replace />;
  }

  // Agora, o TypeScript sabe que 'session.role' definitivamente é do tipo 'Role' (e não 'undefined').
  // Então, podemos usá-lo com segurança na função 'includes'.
  if (!allow.includes(session.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}