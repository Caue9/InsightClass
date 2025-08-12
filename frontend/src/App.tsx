// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Protected from './components/Protected'
import Login from './pages/Login'
import Aluno from './pages/Aluno'
import Professor from './pages/Professor'
import Gestor from './pages/Gestor'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/aluno"
          element={
            <Protected allow={['aluno']}>
              <Aluno />
            </Protected>
          }
        />
        <Route
          path="/professor"
          element={
            <Protected allow={['professor']}>
              <Professor />
            </Protected>
          }
        />
        <Route
          path="/gestor"
          element={
            <Protected allow={['gestor']}>
              <Gestor />
            </Protected>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
