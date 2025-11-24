// server.js

// --- IMPORTAÇÕES DE MÓDULOS ---
const express = require('express');
const cors = require('cors'); // Middleware para permitir requisições de diferentes origens (Cross-Origin Resource Sharing)
const bcrypt = require('bcryptjs'); // Biblioteca para criptografar e comparar senhas
const jwt = require('jsonwebtoken'); // Biblioteca para criar e verificar JSON Web Tokens (JWT)
const db = require('./database'); // Importa a conexão com o banco de dados SQLite

// --- CONFIGURAÇÃO INICIAL DO SERVIDOR ---
const app = express();
const PORT = 3000; // Porta em que o servidor irá rodar
const SECRET_KEY = 'minha_chave_secreta_super_segura'; // Chave secreta para assinar os tokens JWT. Em um ambiente de produção, isso deve ser armazenado de forma segura (ex: variáveis de ambiente).

// --- MIDDLEWARES GLOBAIS ---
app.use(cors()); // Habilita o CORS para que o frontend (rodando em outra porta/domínio) possa fazer requisições para esta API.
app.use(express.json()); // Habilita o servidor a entender e processar corpos de requisição no formato JSON.

// --- ROTAS DE AUTENTICAÇÃO ---

/**
 * Rota para cadastrar um novo usuário.
 * Método: POST
 * Endpoint: /api/cadastro
 * Corpo da requisição: { nome, email, senha }
 */
app.post('/api/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;
    // Criptografa a senha recebida usando bcrypt para não armazená-la em texto puro no banco de dados.
    const senhaHash = bcrypt.hashSync(senha, 8);

    // Executa a query SQL para inserir o novo usuário na tabela 'usuarios'.
    db.run(`INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`,
        [nome, email, senhaHash],
        function (err) {
            // 'function(err)' é usado aqui para ter acesso ao 'this' do contexto do 'db.run'.
            if (err) {
                // Se ocorrer um erro (ex: email já existe, pois é UNIQUE), retorna um erro 400.
                return res.status(400).json({ erro: 'Erro ao cadastrar. Email já existe?' });
            }
            // Se o cadastro for bem-sucedido, retorna uma mensagem de sucesso e o ID do novo usuário.
            res.json({ mensagem: 'Usuário cadastrado com sucesso!', id: this.lastID });
        }
    );
});

// 2. Login
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    // Busca um usuário no banco de dados com o email fornecido.
    db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], (err, usuario) => {
        // Se ocorrer um erro na consulta ou se nenhum usuário for encontrado, retorna um erro de não autorizado.
        if (err || !usuario) {
            return res.status(401).json({ erro: 'Usuário não encontrado.' });
        }

        // Compara a senha fornecida na requisição com a senha criptografada (hash) armazenada no banco.
        const senhaValida = bcrypt.compareSync(senha, usuario.senha);
        if (!senhaValida) {
            // Se as senhas não baterem, retorna um erro de não autorizado.
            return res.status(401).json({ erro: 'Senha incorreta.' });
        }

        // Se a senha for válida, gera um JSON Web Token (JWT).
        // O token contém um 'payload' com informações do usuário (id, nome) e tem um tempo de expiração.
        const token = jwt.sign({ id: usuario.id, nome: usuario.nome }, SECRET_KEY, { expiresIn: '1h' });

        // Retorna o token e o nome do usuário para o frontend. O frontend irá salvar esse token.
        res.json({ token, nome: usuario.nome });
    });
});

/**
 * Middleware de verificação de token.
 * Esta função é usada para proteger rotas. Ela intercepta a requisição,
 * verifica se um token JWT válido foi enviado e, em caso afirmativo,
 * permite que a requisição continue para a rota desejada.
 */
function verificarToken(req, res, next) {
    // Pega o token do cabeçalho 'Authorization' da requisição.
    const tokenHeader = req.headers['authorization'];
    // Se não houver cabeçalho de autorização, nega o acesso.
    if (!tokenHeader) return res.status(403).json({ erro: 'Token não fornecido.' });

    // O token geralmente é enviado no formato "Bearer <token>". Aqui, separamos a palavra "Bearer" do token em si.
    const token = tokenHeader.split(' ')[1];

    // Verifica se o token é válido usando a mesma chave secreta usada para criá-lo.
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        // Se houver um erro na verificação (token expirado, inválido), retorna um erro.
        if (err) return res.status(500).json({ erro: 'Token inválido.' });

        // Se o token for válido, o 'decoded' contém o payload (id, nome).
        // Adicionamos o ID do usuário ao objeto 'req' para que as rotas protegidas saibam qual usuário está fazendo a requisição.
        req.usuarioId = decoded.id;
        // Chama 'next()' para passar a requisição para o próximo middleware ou para a função da rota.
        next();
    });
}

// --- ROTAS DE TAREFAS (Protegidas) ---
// Todas as rotas abaixo usam o middleware 'verificarToken', ou seja, só podem ser acessadas por um usuário logado.

// 3. Listar Tarefas (Apenas do usuário logado)
app.get('/api/tarefas', verificarToken, (req, res) => {
    // A query busca todas as tarefas (`*`) da tabela 'tarefas' ONDE o 'usuario_id' é igual ao ID do usuário logado.
    // O 'req.usuarioId' foi adicionado à requisição pelo middleware 'verificarToken'.
    db.all(`SELECT * FROM tarefas WHERE usuario_id = ?`, [req.usuarioId], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        // Retorna a lista de tarefas do usuário em formato JSON.
        res.json(rows);
    });
});

// 4. Criar Tarefa
app.post('/api/tarefas', verificarToken, (req, res) => {
    const { titulo } = req.body;
    // Insere uma nova tarefa, associando-a ao usuário logado através do 'req.usuarioId'.
    db.run(`INSERT INTO tarefas (titulo, usuario_id) VALUES (?, ?)`,
        [titulo, req.usuarioId],
        function (err) {
            if (err) return res.status(500).json({ erro: err.message });
            // Retorna o objeto da nova tarefa criada, incluindo seu ID e status padrão.
            res.json({ id: this.lastID, titulo, status: 'pendente' });
        }
    );
});

// 5. Atualizar Status (Concluir/Reabrir)
app.put('/api/tarefas/:id', verificarToken, (req, res) => {
    const { id } = req.params; // Pega o ID da tarefa da URL (ex: /api/tarefas/123)
    const { status } = req.body; // Pega o novo status do corpo da requisição. Ex: { "status": "concluida" }

    // Atualiza o status da tarefa. A cláusula 'AND usuario_id = ?' é uma camada extra de segurança
    // para garantir que um usuário só possa modificar suas próprias tarefas.
    db.run(`UPDATE tarefas SET status = ? WHERE id = ? AND usuario_id = ?`,
        [status, id, req.usuarioId],
        function (err) {
            if (err) return res.status(500).json({ erro: err.message });
            // 'this.changes' retorna o número de linhas afetadas. Se for 0, significa que a tarefa não foi encontrada ou não pertence ao usuário.
            if (this.changes === 0) return res.status(404).json({ erro: 'Tarefa não encontrada.' });
            res.json({ mensagem: 'Status atualizado.' });
        }
    );
});

// 6. Excluir Tarefa
app.delete('/api/tarefas/:id', verificarToken, (req, res) => {
    const { id } = req.params; // Pega o ID da tarefa da URL.

    // Deleta a tarefa do banco de dados. A cláusula 'AND usuario_id = ?' garante
    // que um usuário só possa deletar suas próprias tarefas.
    db.run(`DELETE FROM tarefas WHERE id = ? AND usuario_id = ?`,
        [id, req.usuarioId],
        function (err) {
            if (err) return res.status(500).json({ erro: err.message });
            if (this.changes === 0) return res.status(404).json({ erro: 'Tarefa não encontrada.' });
            res.json({ mensagem: 'Tarefa excluída.' });
        }
    );
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});