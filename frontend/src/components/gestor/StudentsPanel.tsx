// src/components/gestor/StudentsPanel.tsx
import React, { useEffect, useState } from 'react';
import { listStudents, addStudent, removeStudent } from '../../lib/mockStore';
import type { Student } from '../../lib/types';

export function StudentsPanel() {
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    email: '',
    password: '',
    classCode: ''
  });
  const [studentStatus, setStudentStatus] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setStudents(await listStudents());
    } catch (error) {
      console.error("Erro ao carregar alunos:", error);
      setStudentStatus("Erro ao carregar alunos.");
    }
  }

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    setStudentStatus('Adicionando...');
    try {
      if (!newStudentForm.name || !newStudentForm.email || !newStudentForm.password || !newStudentForm.classCode) {
        throw new Error('Preencha nome, email, senha e turma.');
      }
      await addStudent({
        name: newStudentForm.name,
        email: newStudentForm.email,
        password_hash: newStudentForm.password,
        classCode: newStudentForm.classCode
      });
      setStudentStatus('Aluno adicionado!');
      setNewStudentForm({ name: '', email: '', password: '', classCode: '' });
      loadStudents();
    } catch (error: any) {
      setStudentStatus(`Erro: ${error.message}`);
    }
  }

  async function handleRemoveStudent(id: string) {
    if (!window.confirm('Tem certeza que deseja remover este aluno?')) return;
    setStudentStatus('Removendo...');
    try {
      await removeStudent(id);
      setStudentStatus('Aluno removido!');
      loadStudents();
    } catch (error: any) {
      setStudentStatus(`Erro: ${error.message}`);
    }
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-3">Cadastrar Novo Aluno</h3>
      <form onSubmit={handleAddStudent} className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Nome do Aluno</label>
          <input
            className="input"
            value={newStudentForm.name}
            onChange={e => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            value={newStudentForm.email}
            onChange={e => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Senha</label>
          <input
            type="password"
            className="input"
            value={newStudentForm.password}
            onChange={e => setNewStudentForm({ ...newStudentForm, password: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Turma (Ex: 1A, 2B)</label>
          <input
            className="input"
            value={newStudentForm.classCode}
            onChange={e => setNewStudentForm({ ...newStudentForm, classCode: e.target.value })}
            required
          />
        </div>
        <div className="col-span-full">
          <button type="submit" className="btn w-full">Adicionar Aluno</button>
        </div>
      </form>
      {studentStatus && <p className="text-sm mt-2 text-slate-600">{studentStatus}</p>}

      <h3 className="text-lg font-semibold mt-6 mb-3">Alunos Cadastrados</h3>
      {students.length === 0 ? (
        <p className="text-sm text-slate-600">Nenhum aluno cadastrado.</p>
      ) : (
        <div className="grid gap-2">
          {students.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 border rounded-xl bg-white">
              <div>
                <div className="font-medium text-slate-900">{s.name}</div>
                <div className="text-sm text-slate-500">{s.email}</div>
                <div className="text-xs text-slate-400">Turma: {s.classCode}</div>
              </div>
              <button onClick={() => handleRemoveStudent(s.id)} className="btn px-3 py-1 text-sm bg-rose-500 hover:bg-rose-600">Remover</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}