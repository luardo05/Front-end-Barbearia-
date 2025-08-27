import { 
  uploadProfilePhoto, 
  getMyProfile, 
  getMyAppointments, 
  cancelMyAppointment, 
  getMyNotifications, 
  markNotificationAsRead 
} from './services/api.js';

// Auth Guard
if (!localStorage.getItem('jwt_token')) {
    window.location.href = '/login.html';
}

// Formata data
const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' });
};

// Carregar perfil
const loadProfile = async () => {
    try {
        const response = await getMyProfile();
        const user = response.data.user;

        document.getElementById('profile-name').textContent = user.nome;
        document.getElementById('profile-info').innerHTML = `
            <p><strong>Email:</strong> ${user.email}</p>
        `;

        if(user.fotoUrl){
          document.getElementById('profile-photo').src = user.fotoUrl;
        }

        document.getElementById('email').value = user.email;
        document.getElementById('numero').value = user.numero || '';
        document.getElementById('nascimento').value = user.dataNascimento || '';
        document.getElementById('idade').value = user.idade || '';
    } catch (error) {
        document.getElementById('profile-info').innerHTML = `<p style="color: red;">Erro ao carregar perfil.</p>`;
    }
};

// Carregar agendamentos
const loadAppointments = async () => {
    const appointmentsDiv = document.getElementById('appointments-list');
    try {
        const response = await getMyAppointments();
        const appointments = response.data.appointments;

        if (appointments.length === 0) {
            appointmentsDiv.innerHTML = '<p>Você ainda não tem agendamentos.</p>';
            return;
        }

        let html = '<ul>';
        appointments.forEach(app => {
            html += `
                <li>
                    <strong>Serviço:</strong> ${app.servico.nome}<br>
                    <strong>Data:</strong> ${formatDate(app.data)}<br>
                    <strong>Status:</strong> ${app.status}
                    ${app.status === 'pendente' || app.status === 'confirmado' ? 
                        `<button class="cancel-btn" data-id="${app._id}">Cancelar</button>` : ''
                    }
                </li><br>
            `;
        });
        html += '</ul>';
        appointmentsDiv.innerHTML = html;

    } catch (error) {
        appointmentsDiv.innerHTML = `<p style="color: red;">Erro ao carregar agendamentos.</p>`;
    }
};

// Carregar notificações
const loadNotifications = async () => {
    const notifDiv = document.getElementById('notifications-list');
    try {
        const response = await getMyNotifications();
        const notifications = response.data.notifications;

        if (notifications.length === 0) {
            notifDiv.innerHTML = '<p>Sem notificações no momento.</p>';
            return;
        }

        let html = '<ul>';
        notifications.forEach(notif => {
            html += `
                <li>
                    ${notif.mensagem} - ${formatDate(notif.createdAt)}
                    ${notif.lida ? '' : `<button class="mark-read-btn" data-id="${notif._id}">Marcar como lida</button>`}
                </li><br>
            `;
        });
        html += '</ul>';
        notifDiv.innerHTML = html;
    } catch (error) {
        notifDiv.innerHTML = `<p style="color: red;">Erro ao carregar notificações.</p>`;
    }
};

// Upload foto
const uploadPhotoForm = document.getElementById('upload-photo-form');
const photoInput = document.getElementById('photo-input');
const uploadMessage = document.getElementById('upload-message');

uploadPhotoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = photoInput.files[0];
    if (!file) {
        alert('Por favor, selecione um arquivo.');
        return;
    }

    const formData = new FormData();
    formData.append('foto', file);

    try {
        uploadMessage.textContent = 'Enviando...';
        await uploadProfilePhoto(formData);
        uploadMessage.style.color = 'green';
        uploadMessage.textContent = 'Foto atualizada com sucesso!';
        loadProfile(); 
    } catch (error) {
        uploadMessage.style.color = 'red';
        uploadMessage.textContent = `Erro: ${error.message}`;
    }
});

// Eventos globais
document.addEventListener('click', async (event) => {
    // Cancelar agendamento
    if (event.target.classList.contains('cancel-btn')) {
        const appointmentId = event.target.dataset.id;
        if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
            try {
                await cancelMyAppointment(appointmentId);
                alert('Agendamento cancelado com sucesso!');
                loadAppointments();
            } catch (error) {
                alert(`Erro ao cancelar: ${error.message}`);
            }
        }
    }

    // Marcar notificação como lida
    if (event.target.classList.contains('mark-read-btn')) {
        const notifId = event.target.dataset.id;
        try {
            await markNotificationAsRead(notifId);
            loadNotifications();
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    }
});

// Carrega ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadAppointments();
    loadNotifications();
});
