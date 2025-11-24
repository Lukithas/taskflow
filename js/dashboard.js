// Garante que o script só será executado após o carregamento completo do HTML.
document.addEventListener("DOMContentLoaded", () => {

    // --- CONFIGURAÇÕES E SELETORES DE ELEMENTOS ---

    // URL base da nossa API backend.
    const API_URL = "http://localhost:3000/api";
    // Pega o token de autenticação e o nome do usuário salvos no login.
    const token = localStorage.getItem("meuToken");
    const nomeUsuario = localStorage.getItem("nomeUsuario");

    // Seleciona os principais elementos da interface com os quais vamos interagir.
    const listaDeTarefas = document.getElementById("lista-de-tarefas");
    const formNovaTarefa = document.getElementById("form-nova-tarefa");
    const inputNovaTarefa = document.getElementById("input-nova-tarefa");

    // --- 1. VERIFICAÇÃO DE AUTENTICAÇÃO (PROTEÇÃO DE ROTA) ---
    // Se não houver um token, o usuário não está logado.
    if (!token) {
        alert("Você precisa estar logado para acessar esta página!");
        // Redireciona para a página de login.
        window.location.href = "index.html";
        return;
    }

    // --- 2. INICIALIZAÇÃO DA INTERFACE ---

    // Exibe o nome do usuário no cabeçalho.
    document.getElementById("user-name").innerText = nomeUsuario || "Usuário";

    // Adiciona o evento de clique para o botão de logout.
    document.getElementById("btn-logout").addEventListener("click", () => {
        // Remove os dados do usuário do localStorage.
        localStorage.removeItem("meuToken");
        localStorage.removeItem("nomeUsuario");
        window.location.href = "index.html";
    });

    // --- 3. CARREGAR TAREFAS (READ) ---
    async function carregarTarefas() {
        try {
            // Faz uma requisição GET para a rota de tarefas, enviando o token no cabeçalho.
            const response = await fetch(`${API_URL}/tarefas`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            // Se o token for inválido ou tiver expirado, o servidor retornará 401 ou 403.
            if (response.status === 401 || response.status === 403) {
                alert("Sessão expirada. Faça login novamente.");
                window.location.href = "index.html";
                return;
            }

            // Converte a resposta da API em um array de objetos JSON.
            const tarefas = await response.json();

            // Limpa a lista de tarefas atual para renderizar a nova.
            listaDeTarefas.innerHTML = "";

            // Se não houver tarefas, exibe uma mensagem informativa.
            if (tarefas.length === 0) {
                listaDeTarefas.innerHTML = "<li style='justify-content:center; color:#777;'>Nenhuma tarefa encontrada.</li>";
                return;
            }

            // Itera sobre cada tarefa recebida e cria um elemento <li> para ela.
            tarefas.forEach(tarefa => {
                const item = document.createElement("li");
                // Adiciona uma classe CSS se a tarefa já estiver concluída.
                if (tarefa.status === "concluida") item.classList.add("tarefa-concluida");

                item.innerHTML = `
                    <span>${tarefa.titulo}</span>
                    <div class="botoes-tarefa">
                        <button title="${tarefa.status === 'pendente' ? 'Concluir' : 'Reabrir'}" class="btn-concluir" data-id="${tarefa.id}" data-status="${tarefa.status}">
                            ${tarefa.status === 'pendente' ? '✓' : '↻'}
                        </button>
                        <button title="Excluir" class="btn-excluir" data-id="${tarefa.id}">×</button>
                    </div>
                `;
                // Adiciona o item da tarefa na lista (<ul>).
                listaDeTarefas.appendChild(item);
            });

        } catch (error) {
            console.error("Erro ao carregar tarefas:", error);
            listaDeTarefas.innerHTML = "<li style='color:red;'>Erro ao carregar tarefas. O servidor está ligado?</li>";
        }
    }

    // --- 4. CRIAR TAREFA (CREATE) ---
    formNovaTarefa.addEventListener("submit", async (e) => {
        e.preventDefault(); // Impede que o formulário recarregue a página.
        const titulo = inputNovaTarefa.value;

        // Validação simples para não criar tarefas vazias.
        if (!titulo.trim()) return;

        // Feedback visual para o usuário enquanto a requisição está em andamento.
        inputNovaTarefa.disabled = true;

        try {
            // Faz uma requisição POST para criar uma nova tarefa.
            const response = await fetch(`${API_URL}/tarefas`, {
                method: "POST",
                // Envia o token e o tipo de conteúdo no cabeçalho.
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ titulo })
            });

            // Se a tarefa foi criada com sucesso...
            if (response.ok) {
                inputNovaTarefa.value = ""; // Limpa o campo de input.
                carregarTarefas(); // Recarrega a lista de tarefas para mostrar a nova.
            } else {
                alert("Erro ao criar tarefa");
            }
        } catch (error) {
            alert("Erro de conexão");
        } finally {
            // Este bloco é executado sempre, seja com sucesso ou erro.
            // Reabilita o input e coloca o foco nele para o usuário poder digitar novamente.
            inputNovaTarefa.disabled = false;
            inputNovaTarefa.focus();
        }
    });

    // --- 5. AÇÕES DOS BOTÕES (UPDATE / DELETE) ---
    // Usamos "event delegation": um único listener no elemento pai (<ul>) para gerenciar
    // os cliques em todos os botões filhos, mesmo os que serão criados dinamicamente.
    listaDeTarefas.addEventListener("click", async (e) => {
        const elemento = e.target;
        // Pega o ID da tarefa a partir do atributo "data-id" do botão clicado.
        const id = elemento.getAttribute("data-id");

        if (!id) return;

        // Ação de EXCLUIR (DELETE)
        if (elemento.classList.contains("btn-excluir")) {
            if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
                try {
                    await fetch(`${API_URL}/tarefas/${id}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    carregarTarefas();
                } catch (error) {
                    alert("Erro ao excluir.");
                }
            }
        }

        // Ação de CONCLUIR/REABRIR (UPDATE)
        if (elemento.classList.contains("btn-concluir")) {
            // Determina o novo status com base no status atual.
            const statusAtual = elemento.getAttribute("data-status");
            const novoStatus = statusAtual === 'pendente' ? 'concluida' : 'pendente';

            try {
                // Faz uma requisição PUT para atualizar o status da tarefa.
                await fetch(`${API_URL}/tarefas/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: novoStatus })
                });
                carregarTarefas();
            } catch (error) {
                alert("Erro ao atualizar status.");
            }
        }
    });

    // --- 6. INICIALIZAÇÃO ---
    // Chama a função para carregar as tarefas assim que a página é carregada.
    carregarTarefas();
});