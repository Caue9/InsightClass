export type AppRole = 'aluno' | 'professor' | 'gestor';

export type Subject = {
  code: string;      
  name: string;      
};

export type Teacher = {
  id: string;        
  name: string;
  subjectCodes: string[];
};

export type Student = {
  id: string;
  name: string;
  email?: string;
  classCode?: string;
};
