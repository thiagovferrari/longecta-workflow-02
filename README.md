# Longecta Workflow 02

Um sistema de gerenciamento de demandas em tempo real, focado em produtividade e colaboração de equipe.

## 🚀 Funcionalidades

- **Fluxo de Demandas**: Kanban/Lista interativa para gerenciar tarefas.
- **Tempo Real**: Veja as alterações dos colegas instantaneamente (Supabase Realtime).
- **Colaboração**: Cursor e presença online de outros membros da equipe.
- **Segurança**: Login com e-mail e senha, com dados protegidos.

## 🛠️ Tecnologias

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Deploy**: Vercel (Recomendado)

## 📦 Como Rodar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/thiagovferrari/longecta-workflow-02.git
cd longecta-workflow-02
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz com:
```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

4. Rode o servidor:
```bash
npm run dev
```

## 🔐 Acesso ao Sistema

O sistema permite **Auto-Cadastro**.
1. Na tela de login, clique em **"Primeiro acesso? Cadastrar"**.
2. Insira seu e-mail e senha.
3. Você será logado automaticamente e poderá ver as demandas da equipe.

## ☁️ Deploy

Este projeto está pronto para ser implantado na Vercel.
Basta conectar o repositório GitHub à Vercel e adicionar as variáveis de ambiente.
