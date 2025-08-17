// src/lib/types.ts

export type AppRole = 'aluno' | 'professor' | 'gestor';

export type Subject = {
  code: string;
  name: string;
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  subjectCodes: string[];
};

export type Student = {
  id: string;
  name: string;
  email: string;
  classCode: string;
};

export type UserCredential = {
  username: string;
  password: string;
  role: AppRole;
};

// --- Tipos para Feedback ---
export type TargetType = 'professor' | 'aluno' | 'turma' | 'materia' | 'coordenacao';
export type FeedbackLabel = 'positivo' | 'neutro' | 'negativo';

export type Feedback = {
  id: string;
  author_id: string;
  author_role: AppRole;
  author_name?: string; // Adicionado: Nome do autor (opcional, só se não for anônimo)
  text: string;
  target_type: TargetType;
  target_id?: string;
  target_name?: string;
  is_anonymous: boolean;
  label?: FeedbackLabel;
  submitted_at: string; // Data e hora do envio (ISO string)
};