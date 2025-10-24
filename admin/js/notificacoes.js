// File: frontend/admin/js/notificacoes.js
import { getMyProfile, getMyNotifications, markNotificationAsRead } from '../../assets/js/services/api.js';

// --- Seletores e Variáveis de Estado (sem alterações) ---
const notificationsContainer = document.getElementById('notifications-container');
const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');
const pageInfoSpan = document.getElementById('page-info');
let currentPage = 1;
let totalPages = 1;

// --- Auth Guard e Carregamento Inicial (sem alterações) ---
document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('jwt_token')) {
        window.location.href = '/index.html';
        return;
    }
    try {
        const profile = await getMyProfile();
        if (profile.data.user.role !== 'admin') {
            alert('Acesso negado.');
            window.location.href = '/client/home.html';
        } else {
            loadNotifications(1);
        }
    } catch (error) {
        window.location.href = '/index.html';
    }
});

// --- Funções Principais ---

const formatDate = (isoString) => new Date(isoString).toLocaleString('pt-BR');

async function loadNotifications(page = 1) {
    try {
        const response = await getMyNotifications(page);
        const notifications = response.data;
        const pagination = response.pagination;

        currentPage = pagination.currentPage;
        totalPages = pagination.totalPages;

        if (notifications.length === 0 && currentPage === 1) {
            notificationsContainer.innerHTML = '<p>Você não tem nenhuma notificação.</p>';
            document.querySelector('.pagination').style.display = 'none';
            return;
        }
        
        document.querySelector('.pagination').style.display = 'flex';

        // --- RENDERIZAÇÃO ATUALIZADA PARA O NOVO DESIGN DE CARDS ---
        notificationsContainer.innerHTML = notifications.map(notif => {
            const isUnread = !notif.lida;
            return `
                <div class="notification-card ${isUnread ? 'unread' : ''}">
                    <p>${notif.mensagem}</p>
                    <small>${formatDate(notif.createdAt)}</small>
                    ${isUnread ? `<br><button class="mark-read-btn" data-id="${notif._id}">Marcar como lida</button>` : ''}
                </div>
            `;
        }).join('');
        
        updatePaginationControls();

    } catch (error) {
        console.error("Erro detalhado ao carregar notificações:", error);
        notificationsContainer.innerHTML = `<p style="color: red;">Erro ao carregar notificações.</p>`;
    }
}

// --- Funções e Listeners de Paginação (copiados de outros arquivos) ---
const updatePaginationControls = () => {
    pageInfoSpan.textContent = `Página ${currentPage} de ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
};

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        loadNotifications(currentPage - 1);
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        loadNotifications(currentPage + 1);
    }
});


// Delega o evento de clique para os botões "Marcar como lida"
notificationsContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('mark-read-btn')) {
        const notificationId = e.target.dataset.id;
        try {
            // Desabilita o botão para evitar cliques duplos
            e.target.disabled = true;
            e.target.textContent = 'Marcando...';

            await markNotificationAsRead(notificationId);
            // Recarrega a lista para refletir a mudança de status
            loadNotifications(currentPage);
        } catch (error) {
            alert(`Erro ao marcar notificação: ${error.message}`);
            e.target.disabled = false;
            e.target.textContent = 'Marcar como lida';
        }
    }
});