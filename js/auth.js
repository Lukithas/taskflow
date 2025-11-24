// Garante que o script só será executado após o carregamento completo do HTML.
document.addEventListener("DOMContentLoaded", () => {
    // --- CONFIGURAÇÕES E SELETORES DE ELEMENTOS ---

    // URL base da nossa API backend.
    const API_URL = "http://localhost:3000/api";

    // Seleciona os principais contêineres e links da interface.
    const loginContainer = document.getElementById("login-container");
    const cadastroContainer = document.getElementById("cadastro-container");
    const linkCadastro = document.getElementById("link-cadastro");
    const linkLogin = document.getElementById("link-login");
    const formLogin = document.getElementById("form-login");
    const formCadastro = document.getElementById("form-cadastro");

    // --- LÓGICA PARA ALTERNAR ENTRE TELAS DE LOGIN E CADASTRO ---

    // Adiciona um evento de clique no link "Criar conta".
    linkCadastro.addEventListener("click", (e) => {
        e.preventDefault(); // Impede que o link recarregue a página.
        loginContainer.style.display = "none"; // Esconde o formulário de login.
        cadastroContainer.style.display = "block"; // Mostra o formulário de cadastro.
        limparMensagens(); // Limpa mensagens de erro/sucesso anteriores.
    });

    // Adiciona um evento de clique no link "Já tenho uma conta".
    linkLogin.addEventListener("click", (e) => {
        e.preventDefault(); // Impede que o link recarregue a página.
        cadastroContainer.style.display = "none"; // Esconde o formulário de cadastro.
        loginContainer.style.display = "block"; // Mostra o formulário de login.
        limparMensagens(); // Limpa mensagens de erro/sucesso anteriores.
    });

    // --- FUNÇÕES AUXILIARES DE INTERFACE ---

    // Função para esconder todas as divs de mensagem.
    function limparMensagens() {
        document.querySelectorAll('.mensagem').forEach(el => el.style.display = 'none');
    }

    // Função para exibir uma mensagem para o usuário (sucesso ou erro).
    function mostrarMensagem(elementoId, texto, tipo) {
        const msgDiv = document.getElementById(elementoId);
        msgDiv.innerText = texto;
        msgDiv.className = `mensagem ${tipo === 'erro' ? 'mensagem-erro' : 'mensagem-sucesso'}`;
        msgDiv.style.display = 'block';
    }

    // --- LÓGICA DE LOGIN ---

    // Adiciona um evento de "submit" (envio) ao formulário de login.
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault(); // Impede o comportamento padrão de recarregar a página.

        // Seleciona os elementos do formulário.
        const btn = document.getElementById("btn-login");
        const email = document.getElementById("login-email").value;
        const senha = document.getElementById("login-senha").value;

        // Fornece um feedback visual para o usuário, desabilitando o botão.
        btn.innerText = "Entrando...";
        btn.disabled = true;
        limparMensagens();

        try {
            // Faz a requisição para a API de login.
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha })
            });

            // Converte a resposta da API para JSON.
            const data = await response.json();

            if (response.ok) {
                // Se o login for bem-sucedido (status 2xx), salva o token e o nome do usuário.
                localStorage.setItem("meuToken", data.token);
                localStorage.setItem("nomeUsuario", data.nome);
                // Redireciona o usuário para a página do dashboard.
                window.location.href = "dashboard.html";
            } else {
                // Se a API retornar um erro (ex: senha incorreta), mostra a mensagem de erro.
                mostrarMensagem("msg-login", data.erro || "Erro no login", "erro");
            }
        } catch (error) {
            // Se houver um erro de rede (ex: servidor offline), mostra uma mensagem genérica.
            mostrarMensagem("msg-login", "Erro ao conectar com o servidor.", "erro");
        } finally {
            // Este bloco é executado sempre, seja em caso de sucesso ou erro.
            // Restaura o estado original do botão.
            btn.innerText = "Entrar";
            btn.disabled = false;
        }
    });

    // --- LÓGICA DE CADASTRO ---

    // Adiciona um evento de "submit" (envio) ao formulário de cadastro.
    formCadastro.addEventListener("submit", async (e) => {
        e.preventDefault(); // Impede o recarregamento da página.

        // Seleciona os elementos do formulário.
        const btn = document.getElementById("btn-cadastro");
        const nome = document.getElementById("cadastro-nome").value;
        const email = document.getElementById("cadastro-email").value;
        const senha = document.getElementById("cadastro-senha").value;

        // Feedback visual para o usuário.
        btn.innerText = "Criando...";
        btn.disabled = true;
        limparMensagens();

        try {
            // Faz a requisição para a API de cadastro.
            const response = await fetch(`${API_URL}/cadastro`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, senha })
            });

            // Converte a resposta para JSON.
            const data = await response.json();

            if (response.ok) {
                // Se o cadastro for bem-sucedido, mostra uma mensagem de sucesso.
                mostrarMensagem("msg-cadastro", "Conta criada! Redirecionando para login...", "sucesso");
                // Limpa os campos do formulário.
                formCadastro.reset();
                // Após um breve intervalo, simula um clique no link de login para levar o usuário à tela correta.
                setTimeout(() => {
                    document.getElementById("link-login").click();
                    mostrarMensagem("msg-login", "Conta criada com sucesso!", "sucesso");
                }, 1500);
            } else {
                // Se a API retornar um erro (ex: email já existe), mostra a mensagem.
                mostrarMensagem("msg-cadastro", data.erro || "Erro no cadastro", "erro");
            }
        } catch (error) {
            // Trata erros de conexão com o servidor.
            mostrarMensagem("msg-cadastro", "Erro ao conectar com o servidor.", "erro");
        } finally {
            // Restaura o estado original do botão.
            btn.innerText = "Criar Conta";
            btn.disabled = false;
        }
    });
});