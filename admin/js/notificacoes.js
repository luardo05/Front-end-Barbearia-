import { getMyProfile, getMyNotifications, markNotificationAsRead } from '../../assets/js/services/api.js';

const notificationsContainer = document.getElementById('notifications-container');
// --- Seletores de Paginação ---
const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');
const pageInfoSpan = document.getElementById('page-info');
let currentPage = 1;
let totalPages = 1;

const formatDate = (isoString) => {
    if (!isoString) return 'Data indisponível';
    return new Date(isoString).toLocaleString('pt-br');
};

// --- Auth Guard (Versão do Admin) ---
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
            loadNotifications(1);
        }
    } catch (error) {
        window.location.href = '/login.html';
    }
});

async function loadNotifications(page = 1) {
    try {
        const response = await getMyNotifications(page);
        const notifications = response.data;
        const pagination = response.pagination;

        currentPage = pagination.currentPage;
        totalPages = pagination.totalPages;
        if (notifications.length === 0) {
            notificationsContainer.innerHTML = '<p>Você não tem nenhuma notificação.</p>';
            return;
        }

        let html = '';
        notifications.forEach(notif => {
            const isUnread = !notif.lida;
            html += `
                <div class="notification-item ${isUnread ? 'unread' : ''}">
                    <p>${notif.mensagem}</p>
                    <small>${formatDate(notif.createdAt)}</small>
                    ${isUnread ? `<br><button class="mark-read-btn" data-id="${notif._id}">Marcar como lida</button>` : ''}
                </div>
            `;
        });
        notificationsContainer.innerHTML = html;
        updatePaginationControls();

    } catch (error) {
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