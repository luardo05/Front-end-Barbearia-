// File: frontend/admin/js/gerenciarUsuarios.js
import { getMyProfile, getAllUsers, adminCreateUser, deleteUser } from '../../assets/js/services/api.js';

// Auth Guard
document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('jwt_token')) {
        window.location.href = '/login.html';
        return;
    }
    try {
        const profile = await getMyProfile();
        if (profile.data.user.role !== 'admin') {
            alert('Acesso negado.');
            window.location.href = '/client/home.html';
        } else {
            loadUsers();
        }
    } catch (error) {
        window.location.href = '/login.html';
    }
});

const usersTableContainer = document.getElementById('users-table-container');
const addUserForm = document.getElementById('add-user-form');
const formMessage = document.getElementById('form-message');

const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');
const pageInfoSpan = document.getElementById('page-info');
let currentPage = 1;
let totalPages = 1;

// Carrega e exibe a lista de usuários em uma tabela
const loadUsers = async (page = 1) => {
    try {
        // Mostra uma mensagem de carregamento enquanto busca os dados
        usersTableContainer.innerHTML = '<p>Carregando usuários...</p>';
        const response = await getAllUsers({ paginated: true, page: page, limit: 10 });

        // 1. Chama a API para buscar a página de usuários solicitada
        const users = response.data;
        const pagination = response.pagination;

        // 2. Atualiza as variáveis globais de controle de paginação
        currentPage = pagination.currentPage;
        totalPages = pagination.totalPages;

        // 3. Verifica se há usuários para exibir
        if (users.length === 0 && currentPage === 1) {
            usersTableContainer.innerHTML = '<p>Nenhum usuário encontrado.</p>';
            updatePaginationControls(); // Atualiza os botões mesmo sem usuários
            return;
        }

        // 4. Constrói a tabela HTML dinamicamente
        let tableHtml = `
            <table class="users-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Papel</th>
                        <th>Cadastro</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // 5. Itera sobre os usuários retornados e cria uma linha (<tr>) para cada um
        users.forEach(user => {
            tableHtml += `
                <tr>
                    <td>${user.nome}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>${new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td data-label="Ações" class="actions">
                        <a href="form-usuario.html?id=${user._id}">
                            <button class="btn-edit">Editar</button>
                        </a>
                        <button class="delete-user-btn btn-delete" data-id="${user._id}">Excluir</button>
                    </td>
                </tr>
            `;
        });

        tableHtml += '</tbody></table>';

        // 6. Insere a tabela construída no container da página
        usersTableContainer.innerHTML = tableHtml;

        // 7. Atualiza os botões e o texto de informação da paginação
        updatePaginationControls();

    } catch (error) {
        // Em caso de erro, exibe uma mensagem de falha
        usersTableContainer.innerHTML = `<p style="color: red;">Erro ao carregar usuários: ${error.message}</p>`;
    }
};

// --- NOVA FUNÇÃO PARA ATUALIZAR OS CONTROLES DE PAGINAÇÃO ---
const updatePaginationControls = () => {
    pageInfoSpan.textContent = `Página ${currentPage} de ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
};

// Event Listeners para os botões de paginação
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        loadUsers(currentPage - 1);
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        loadUsers(currentPage + 1);
    }
});

// Lida com a submissão do formulário para adicionar novo usuário
addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userData = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        senha: document.getElementById('senha').value,
        dataNascimento: document.getElementById('dataNascimento').value,
        role: document.getElementById('role').value,
    };

    try {
        formMessage.textContent = 'Adicionando...';
        await adminCreateUser(userData);
        formMessage.style.color = 'green';
        formMessage.textContent = 'Usuário adicionado com sucesso!';
        addUserForm.reset();
        loadUsers(); // Recarrega a lista de usuários
    } catch (error) {
        formMessage.style.color = 'red';
        formMessage.textContent = `Erro: ${error.message}`;
    }
});

// Delega o evento de clique para os botões de exclusão na tabela
usersTableContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-user-btn')) {
        const userId = e.target.dataset.id;
        if (confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
            try {
                await deleteUser(userId);
                alert('Usuário excluído com sucesso!');
                loadUsers(); // Recarrega a lista
            } catch (error) {
                alert(`Erro ao excluir usuário: ${error.message}`);
            }
        }
    }
});