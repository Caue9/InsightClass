// src/components/gestor/TeachersPanel.tsx
import React, { useEffect, useState } from 'react';
import { listTeachers, addTeacher, removeTeacher, listSubjects } from '../../lib/mockStore';
import type { Teacher, Subject } from '../../lib/types';

export function TeachersPanel() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]); // Para o select de matérias
  const [newTeacherForm, setNewTeacherForm] = useState({ name: '', email: '', password: '', subjectCodes: [] as string[] });
  const [teacherStatus, setTeacherStatus] = useState('');

  useEffect(() => {
    loadTeachersAndSubjects();
  }, []);

  async function loadTeachersAndSubjects() {
    try {
      setTeachers(await listTeachers());
      setSubjects(await listSubjects());
    } catch (error) {
      console.error("Erro ao carregar professores/matérias:", error);
      setTeacherStatus("Erro ao carregar dados.");
    }
  }

  async function handleAddTeacher(e: React.FormEvent) {
    e.preventDefault();
    setTeacherStatus('Adicionando...');
    try {
      if (!newTeacherForm.name || !newTeacherForm.email || !newTeacherForm.password) {
        throw new Error('Preencha nome, email e senha.');
      }
      await addTeacher(newTeacherForm.name, newTeacherForm.subjectCodes, newTeacherForm.email, newTeacherForm.password);
      setTeacherStatus('Professor adicionado!');
      setNewTeacherForm({ name: '', email: '', password: '', subjectCodes: [] });
      loadTeachersAndSubjects();
    } catch (error: any) {
      setTeacherStatus(`Erro: ${error.message}`);
    }
  }

  async function handleRemoveTeacher(id: string) {
    if (!window.confirm('Tem certeza que deseja remover este professor?')) return;
    setTeacherStatus('Removendo...');
    try {
      await removeTeacher(id);
      setTeacherStatus('Professor removido!');
      loadTeachersAndSubjects();
    } catch (error: any) {
      setTeacherStatus(`Erro: ${error.message}`);
    }
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-3">Cadastrar Novo Professor</h3>
      <form onSubmit={handleAddTeacher} className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Nome do Professor</label>
          <input
            className="input"
            value={newTeacherForm.name}
            onChange={e => setNewTeacherForm({ ...newTeacherForm, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            value={newTeacherForm.email}
            onChange={e => setNewTeacherForm({ ...newTeacherForm, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Senha</label>
          <input
            type="password"
            className="input"
            value={newTeacherForm.password}
            onChange={e => setNewTeacherForm({ ...newTeacherForm, password: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Matérias que Leciona</label>
          <select
            multiple
            className="input h-24"
            value={newTeacherForm.subjectCodes}
            onChange={e => setNewTeacherForm({ ...newTeacherForm, subjectCodes: Array.from(e.target.selectedOptions, option => option.value) })}
          >
            {subjects.map(s => (
              <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">Segure Ctrl/Cmd para selecionar múltiplas.</p>
        </div>
        <div className="col-span-full">
          <button type="submit" className="btn w-full">Adicionar Professor</button>
        </div>
      </form>
      {teacherStatus && <p className="text-sm mt-2 text-slate-600">{teacherStatus}</p>}

      <h3 className="text-lg font-semibold mt-6 mb-3">Professores Cadastrados</h3>
      {teachers.length === 0 ? (
        <p className="text-sm text-slate-600">Nenhum professor cadastrado.</p>
      ) : (
        <div className="grid gap-2">
          {teachers.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 border rounded-xl bg-white">
              <div>
                <div className="font-medium text-slate-900">{t.name}</div>
                <div className="text-sm text-slate-500">{t.email}</div>
                <div className="text-xs text-slate-400">Matérias: {t.subjectCodes.join(', ') || 'Nenhuma'}</div>
              </div>
              <button onClick={() => handleRemoveTeacher(t.id)} className="btn px-3 py-1 text-sm bg-rose-500 hover:bg-rose-600">Remover</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}