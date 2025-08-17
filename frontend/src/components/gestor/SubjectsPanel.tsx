// src/components/gestor/SubjectsPanel.tsx
import React, { useEffect, useState } from 'react';
import { listSubjects, addSubject, removeSubject } from '../../lib/mockStore';
import type { Subject } from '../../lib/types';

export function SubjectsPanel() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubjectForm, setNewSubjectForm] = useState({ code: '', name: '' });
  const [subjectStatus, setSubjectStatus] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    try {
      setSubjects(await listSubjects());
    } catch (error) {
      console.error("Erro ao carregar matérias:", error);
      setSubjectStatus("Erro ao carregar matérias.");
    }
  }

  async function handleAddSubject(e: React.FormEvent) {
    e.preventDefault();
    setSubjectStatus('Adicionando...');
    try {
      await addSubject(newSubjectForm);
      setSubjectStatus('Matéria adicionada!');
      setNewSubjectForm({ code: '', name: '' });
      loadSubjects();
    } catch (error: any) {
      setSubjectStatus(`Erro: ${error.message}`);
    }
  }

  async function handleRemoveSubject(code: string) {
    if (!window.confirm(`Tem certeza que deseja remover a matéria ${code}?`)) return;
    setSubjectStatus('Removendo...');
    try {
      await removeSubject(code);
      setSubjectStatus('Matéria removida!');
      loadSubjects();
    } catch (error: any) {
      setSubjectStatus(`Erro: ${error.message}`);
    }
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-3">Cadastrar Nova Matéria</h3>
      <form onSubmit={handleAddSubject} className="grid sm:grid-cols-3 gap-4 items-end">
        <div>
          <label className="label">Código (Ex: MAT-101)</label>
          <input
            className="input"
            value={newSubjectForm.code}
            onChange={e => setNewSubjectForm({ ...newSubjectForm, code: e.target.value.toUpperCase() })}
            required
          />
        </div>
        <div>
          <label className="label">Nome da Matéria</label>
          <input
            className="input"
            value={newSubjectForm.name}
            onChange={e => setNewSubjectForm({ ...newSubjectForm, name: e.target.value })}
            required
          />
        </div>
        <div>
          <button type="submit" className="btn w-full">Adicionar Matéria</button>
        </div>
      </form>
      {subjectStatus && <p className="text-sm mt-2 text-slate-600">{subjectStatus}</p>}

      <h3 className="text-lg font-semibold mt-6 mb-3">Matérias Cadastradas</h3>
      {subjects.length === 0 ? (
        <p className="text-sm text-slate-600">Nenhuma matéria cadastrada.</p>
      ) : (
        <div className="grid gap-2">
          {subjects.map(s => (
            <div key={s.code} className="flex items-center justify-between p-3 border rounded-xl bg-white">
              <div>
                <div className="font-medium text-slate-900">{s.name}</div>
                <div className="text-sm text-slate-500">{s.code}</div>
              </div>
              <button onClick={() => handleRemoveSubject(s.code)} className="btn px-3 py-1 text-sm bg-rose-500 hover:bg-rose-600">Remover</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}