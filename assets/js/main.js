// File: frontend/assets/js/main.js
import socket from './services/socket-client.js';
import { showToast } from './utils/notifications-ui.js';

// Verifica se o socket foi conectado com sucesso
if (socket) {
    // --- OUVINTES GLOBAIS DE EVENTOS ---

    // Ouvinte para administradores
    socket.on('new_appointment', (data) => {
        console.log('Evento de novo agendamento recebido:', data);
        showToast(`Novo agendamento: ${data.message}`, 'info');
        // Opcional: tocar um som de notificação
    });

    socket.on('appointment_cancelled', (data) => {
        console.log('Evento de cancelamento recebido:', data);
        showToast(`Aviso: ${data.message}`, 'info');
    });

    // Ouvinte para clientes
    socket.on('status_update', (data) => {
        console.log('Evento de status recebido:', data);
        showToast(`Atualização: ${data.message}`, 'success');
    });

    // --- NOVOS OUVINTES PARA ANIVERSÁRIOS ---

    // Ouvinte para QUALQUER usuário (cliente ou admin) que recebeu uma notificação.
    // O backend já envia para a "sala" privada do usuário aniversariante.
    socket.on('new_notification', (data) => {
        console.log('Nova notificação recebida:', data);
        // Usamos um emoji de presente para destacar que é uma notificação especial.
        showToast(`🎁 ${data.message}`, 'success');
    });

    // Ouvinte exclusivo para ADMINISTRADORES, para lembretes.
    socket.on('info_notification', (data) => {
        console.log('Nova notificação informativa recebida:', data);
        showToast(`🔔 ${data.message}`, 'info');
    });

    // Você pode adicionar mais ouvintes globais aqui
    // Ex: socket.on('birthday_wish', (data) => { ... });
}

// Lógica para o botão de logout (se existir em um cabeçalho comum)
const logoutButton = document.getElementById('logout-btn');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('jwt_token');
        if(socket) socket.disconnect();
        window.location.href = '/login.html';
    });
}