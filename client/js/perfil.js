import { uploadProfilePhoto, getMyProfile, getMyAppointments, cancelMyAppointment, getMyNotifications, markNotificationAsRead } from '../../assets/js/services/api.js';

// Auth Guard
if (!localStorage.getItem('jwt_token')) {
    window.location.href = '/login.html';
}

// Função para formatar a data para um padrão legível
const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', {
        dateStyle: 'long',
        timeStyle: 'short',
    });
};

// Função para carregar e exibir os dados do perfil
const loadProfile = async () => {
    const profileDiv = document.getElementById('profile-info');
    try {
        const response = await getMyProfile();
        const user = response.data.user;
        profileDiv.innerHTML = `
            <p><strong>Nome:</strong> ${user.nome}</p>
            <p><strong>Email:</strong> ${user.email}</p>
        `;
    } catch (error) {
        profileDiv.innerHTML = `<p style="color: red;">Erro ao carregar perfil.</p>`;
    }
};

// Função para carregar e exibir os agendamentos
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

// Função para carregar e exibir as notificações




// Carrega tudo ao iniciar a página
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadAppointments();
});

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
    formData.append('foto', file); // O nome 'foto' deve bater com o upload.single('foto') no backend

    try {
        uploadMessage.textContent = 'Enviando...';
        await uploadProfilePhoto(formData);
        uploadMessage.style.color = 'green';
        uploadMessage.textContent = 'Foto atualizada com sucesso!';
        // Opcional: recarregar os dados do perfil para mostrar a nova foto
        loadProfile(); 
    } catch (error) {
        uploadMessage.style.color = 'red';
        uploadMessage.textContent = `Erro: ${error.message}`;
    }
});

document.addEventListener('click', async (event) => {
    // Cancelar agendamento
    if (event.target.classList.contains('cancel-btn')) {
        // Se você vir esta mensagem, o seletor está funcionando!
        
        const appointmentId = event.target.dataset.id;

        if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
            try {
                await cancelMyAppointment(appointmentId);
                alert('Agendamento cancelado com sucesso!');
                loadAppointments(); // Recarrega a lista
            } catch (error) {
                alert(`Erro ao cancelar: ${error.message}`);
            }
        }
    }
});