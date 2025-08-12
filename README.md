# InsightClass — Análise de Sentimento de Feedback Escolar README NAO FINALIZADO

![Python Version](https://img.shields.io/badge/Python-3.10%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95+-green)
![React](https://img.shields.io/badge/React-18-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

## Visão Geral

O **InsightClass** é uma ferramenta desenvolvida para transformar feedbacks textuais de alunos e professores em dados quantitativos e visuais.  
Seu objetivo principal é auxiliar coordenadores e docentes a compreenderem rapidamente o sentimento geral de uma turma ou disciplina,  
facilitando a identificação de pontos de melhoria e sucesso.

Este projeto foi concebido com foco em uma aplicação prática universitária, integrando conceitos essenciais de **Processamento de Linguagem Natural (PLN)**, **Machine Learning** e **Desenvolvimento Web**.

## Objetivos

- Coletar feedback textual detalhado sobre aulas, disciplinas e corpo docente.
- Classificar os feedbacks em categorias de sentimento: positivo, neutro ou negativo.
- Visualizar métricas e tendências de sentimento através de um dashboard interativo.

## Tecnologias Utilizadas

### Backend
- **Python 3.10+** — Linguagem de programação principal.
- **FastAPI** — Framework para construção de APIs eficientes e robustas.
- **scikit-learn** — Biblioteca para modelagem e treinamento do classificador de sentimento.
- **pandas** — Manipulação e análise de dados.
- **joblib** — Salvamento e carregamento otimizado de modelos treinados.

### Frontend
- **React + Vite** — Biblioteca e ferramenta de build para construção da interface de usuário.
- **TailwindCSS** — Framework CSS para estilização rápida e responsiva.
- **Integração com API** — Comunicação com o backend via `fetch`.

### Infraestrutura
- **GitHub** — Controle de versão e colaboração.
- **Azure for Students** — (Opcional) Ambiente potencial para deploy futuro.
- **(Futuro)** PostgreSQL / Google Sheets — Armazenamento persistente de dados.

## Estrutura do Projeto

```
InsightClass/
├── data/                # Conjunto de dados (anonimizados)
├── models/              # Modelos treinados (.joblib) — ignorados no Git
├── src/
│   ├── train.py         # Script de treinamento do modelo
│   ├── utils_text.py    # Funções auxiliares de texto
│   └── api/
│       └── serve.py     # API FastAPI
├── frontend/            # Aplicação React/Tailwind (dashboard)
├── requirements.txt     # Dependências do backend
├── .gitignore
└── README.md
```

## Como Rodar Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU-USUARIO/InsightClass.git
cd InsightClass
```

### 2. Criar ambiente virtual e instalar dependências
```bash
python -m venv .venv
# Linux/macOS
source .venv/bin/activate
# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

### 3. Treinar o modelo
```bash
python src/train.py --csv data/rotulados_ensino_medio_plus.csv --out models/sentiment.joblib
```

### 4. Rodar a API
```bash
uvicorn src/api/serve:app --host 0.0.0.0 --port 8000 --reload
```
A API estará disponível em: [http://localhost:8000/docs](http://localhost:8000/docs)

## Como Rodar o Frontend
```bash
cd frontend
npm install
npm run dev
```
O site estará disponível em: [http://localhost:5173/](http://localhost:5173/)

## Fluxo do Sistema
1. **Coleta de Feedback** — Usuários preenchem o formulário no frontend.
2. **Processamento** — API processa o texto com o modelo treinado e retorna a classificação.
3. **Visualização** — Dashboard exibe gráficos e métricas agregadas.

## Próximos Passos
- Implementar banco de dados (PostgreSQL).
- Criar dashboard mais robusto e interativo.
- Adicionar autenticação e autorização.
- Deploy do backend e frontend na nuvem.

## Avisos Importantes
- **Anonimização de Dados** — Proteção da privacidade.
- **Compartilhamento de Modelos** — Evitar vazamento de informações sensíveis.
- **Uso Educacional** — Não recomendado para produção sem ajustes.