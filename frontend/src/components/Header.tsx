import { Link } from 'react-router-dom';

// The TabLink function is removed entirely as it won't be used here.

interface HeaderProps {
  // We keep 'current' for consistency if it's used elsewhere, but it's not strictly needed here anymore.
  current: 'aluno' | 'professor' | 'gestor';
  onLogout: () => void;
}

export default function Header({ current, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-slate-900 text-white grid place-items-center text-sm font-bold">
            IC
          </div>
          <h1 className="font-semibold text-slate-900">InsightClass</h1>
        </div>
        <nav className="flex gap-1">
          {/* Only the "Sair" button remains */}
          <button
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100"
            onClick={onLogout}
          >
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}