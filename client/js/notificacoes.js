// File: frontend/client/js/notificacoes.js
import { getMyProfile, getMyNotifications, markNotificationAsRead } from '../../assets/js/services/api.js';

// --- Seletores de Elementos ---
const notificationsContainer = document.getElementById('notifications-container');
const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');
const pageInfoSpan = document.getElementById('page-info');

// --- Variáveis de Estado ---
let currentPage = 1;
let totalPages = 1;

// --- Auth Guard e Carregamento Inicial ---
document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('jwt_token')) {
        window.location.href = '/login.html';
        return;
    }
    try {
        await getMyProfile();
        loadNotifications(); // Carrega a primeira página
    } catch (error) {
        window.location.href = '/login.html';
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
            // Esconde os controles de paginação se não houver notificações
            document.querySelector('.pagination').style.display = 'none';
            return;
        }

        // Garante que os controles de paginação fiquem visíveis se houver notificações
        document.querySelector('.pagination').style.display = 'flex';

        // Renderiza os cards de notificação
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

// --- Funções e Listeners de Paginação ---
function updatePaginationControls() {
    pageInfoSpan.textContent = `Página ${currentPage} de ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

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
    const readButton = e.target.closest('.mark-read-btn');
    if (readButton) {
        const notificationId = readButton.dataset.id;
        try {
            readButton.disabled = true;
            readButton.textContent = 'Marcando...';

            await markNotificationAsRead(notificationId);
            loadNotifications(currentPage); // Recarrega a página atual
        } catch (error) {
            alert(`Erro ao marcar notificação: ${error.message}`);
            // Não precisa reabilitar o botão, pois a lista será recarregada
        }
    }
});