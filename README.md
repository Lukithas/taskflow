# TaskFlow - Gerenciador de Tarefas Simples



TaskFlow é uma aplicação web full-stack para gerenciamento de tarefas (To-Do List). Ela permite que os usuários se cadastrem, façam login e gerenciem suas próprias listas de tarefas de forma segura e individual.

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [🚀 Como Executar](#-como-executar)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalação](#instalação)
- [📂 Estrutura do Projeto](#-estrutura-do-projeto)
- [📝 Licença](#-licença)

---

## 📖 Sobre o Projeto

Este projeto foi desenvolvido como uma aplicação completa (frontend e backend) para demonstrar um sistema de autenticação de usuários e operações CRUD (Criar, Ler, Atualizar, Deletar) em um ambiente seguro.

O **backend** é uma API RESTful construída com Node.js e Express, responsável pela lógica de negócio, autenticação com JWT (JSON Web Tokens) e persistência de dados em um banco de dados SQLite.

O **frontend** é uma interface de usuário limpa e reativa, construída com HTML, CSS e JavaScript puro (Vanilla JS), que consome a API do backend para fornecer uma experiência de usuário fluida.

---

## ✨ Funcionalidades

- **Autenticação de Usuário**:
  - Cadastro de novos usuários com senha criptografada.
  - Login seguro com geração de token de autenticação (JWT).
  - Rotas da API protegidas, acessíveis apenas por usuários autenticados.
- **Gerenciamento de Tarefas (CRUD)**:
  - **Criar**: Adicionar novas tarefas à lista.
  - **Ler**: Visualizar todas as tarefas associadas ao usuário logado.
  - **Atualizar**: Marcar tarefas como "concluídas" ou "pendentes".
  - **Deletar**: Remover tarefas da lista.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias:

#### **Backend (API)**
- **Node.js**: Ambiente de execução JavaScript no servidor.
- **Express.js**: Framework para criação da API REST.
- **SQLite3**: Banco de dados relacional leve e baseado em arquivo.
- **jsonwebtoken (JWT)**: Para geração e verificação de tokens de autenticação.
- **bcrypt.js**: Para criptografia de senhas.
- **CORS**: Para permitir a comunicação entre o frontend e o backend.

#### **Frontend**
- **HTML5**: Estrutura da aplicação.
- **CSS3**: Estilização e design.
- **JavaScript (Vanilla JS)**: Manipulação do DOM, interatividade e comunicação com a API (usando `fetch`).

---

## 🚀 Como Executar

Siga os passos abaixo para executar o projeto em seu ambiente local.

### Pré-requisitos

Você precisa ter o Node.js (que inclui o npm) instalado em sua máquina.

### Instalação

1. **Clone o repositório** (ou simplesmente descompacte os arquivos em uma pasta):
   ```bash
   # Se estiver usando git
   git clone https://github.com/seu-usuario/projeto-taskflow.git
   ```

2. **Navegue até a pasta do projeto**:
   ```bash
   cd projeto-taskflow
   ```

3. **Instale as dependências do backend**:
   ```bash
   npm install
   ```

4. **Inicie o servidor backend**:
   ```bash
   node server.js
   ```
   O servidor estará rodando em `http://localhost:3000`.

5. **Abra o frontend**:
   - Abra o arquivo `index.html` diretamente no seu navegador.
   - **Recomendado**: Use uma extensão como o Live Server no VS Code para evitar possíveis problemas com CORS e ter recarregamento automático.

---

## 📂 Estrutura do Projeto

```
projeto-taskflow/
├── css/
│   └── style.css         # Folha de estilos principal
├── node_modules/         # Dependências do Node.js
├── auth.js               # Lógica do frontend para login/cadastro
├── dashboard.js          # Lógica do frontend para o painel de tarefas
├── database.js           # Configuração e inicialização do banco de dados SQLite
├── index.html            # Página de login e cadastro
├── dashboard.html        # Página do painel de tarefas
├── package.json          # Metadados e dependências do projeto
├── package-lock.json
└── server.js             # Arquivo principal do servidor backend (API)
```

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.