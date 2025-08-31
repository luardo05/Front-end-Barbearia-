// File: frontend/admin/js/gerenciarUsuarios.js
import { getMyProfile, getAllUsers, deleteUser } from '../../assets/js/services/api.js';

document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('jwt_token')) {
        window.location.href = '/login.html';
        return;
    }
    try {
        const profile = await getMyProfile();
        if (profile.data.user.role !== 'admin') {
            alert('Acesso negado.');
            window.location.href = '/client/index.html';
        } else {
            loadUsers();
        }
    } catch (error) {
        window.location.href = '/login.html';
    }
});

const usersContainer = document.getElementById('users-container');
const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');
const pageInfoSpan = document.getElementById('page-info');

let currentPage = 1;
let totalPages = 1;

const loadUsers = async (page = 1) => {
    try {
        usersContainer.innerHTML = '<p>Carregando usuários...</p>';
        const response = await getAllUsers({ paginated: true, page, limit: 6 });

        const users = response.data;
        const pagination = response.pagination;

        currentPage = pagination.currentPage;
        totalPages = pagination.totalPages;

        if (users.length === 0 && currentPage === 1) {
            usersContainer.innerHTML = '<p>Nenhum usuário encontrado.</p>';
            updatePaginationControls();
            return;
        }

        let cardsHtml = '';
        users.forEach(user => {
            cardsHtml += `
                <div class="user-card">
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-info">
                        <span class="user-detail"><b>Nome:</b> ${user.nome}</span>
                        <span class="user-detail"><b>Email:</b> ${user.email}</span>
                        <span class="user-detail"><b>Perfil:</b> ${user.role}</span>
                        <span class="user-detail"><b>Cadastrado em:</b> ${new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                        <div class="user-actions">
                            <a href="form-usuario.html?id=${user._id}">
                                <button class="edit-btn"><i class="fas fa-pen"></i> Editar</button>
                            </a>
                            <button class="delete-user-btn" data-id="${user._id}">
                                <i class="fas fa-ban"></i> Excluir
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        usersContainer.innerHTML = cardsHtml;
        updatePaginationControls();

    } catch (error) {
        usersContainer.innerHTML = `<p style="color: red;">Erro ao carregar usuários: ${error.message}</p>`;
    }
};

const updatePaginationControls = () => {
    pageInfoSpan.textContent = `Página ${currentPage} de ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
};

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) loadUsers(currentPage - 1);
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) loadUsers(currentPage + 1);
});

// Delegação para exclusão
usersContainer.addEventListener('click', async (e) => {
    if (e.target.closest('.delete-user-btn')) {
        const userId = e.target.closest('.delete-user-btn').dataset.id;
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            try {
                await deleteUser(userId);
                alert('Usuário excluído com sucesso!');
                loadUsers();
            } catch (error) {
                alert(`Erro ao excluir usuário: ${error.message}`);
            }
        }
    }
});
