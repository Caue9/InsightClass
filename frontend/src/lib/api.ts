// src/lib/api.ts
import type { AppRole } from './types';

export type Target = 'professor' | 'curso' | 'turma' | 'coordenacao';
export type SentLabel = 'positivo' | 'neutro' | 'negativo';

export type FeedbackItem = {
  id?: string;
  texto: string;
  author_role: AppRole;         // 'aluno' | 'professor' | 'gestor'
  target_type: Target;          // para feedbacks do aluno é 'professor' normalmente
  course_code?: string;         // código da matéria
  teacher_id?: string;          // professor selecionado
  is_anonymous?: boolean;       // ADICIONADO AQUI CONFORME SOLICITADO
  label?: SentLabel;
  submitted_at?: string;
};

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';

// mapeia 'gestor' -> 'coordenador' só no wire protocol
function toApiRole(role: AppRole): 'aluno'|'professor'|'coordenador' {
  return role === 'gestor' ? 'coordenador' : role;
}

export async function enviarFeedback(item: FeedbackItem) {
  const payload = { ...item, author_role: toApiRole(item.author_role) };
  const res = await fetch(`${BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function listarFeedbacks(params: { limit?: number; course_code?: string; author_role?: AppRole } = {}) {
  const qs = new URLSearchParams();
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.course_code) qs.set('course_code', params.course_code);
  if (params.author_role) qs.set('author_role', toApiRole(params.author_role));
  const url = `${BASE}/feedback${qs.toString() ? `?${qs.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}