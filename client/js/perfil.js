// File: frontend/client/js/perfil.js
import {
    getMyProfile,
    updateUser,
    uploadProfilePhoto,
    getMyAppointments,
    cancelMyAppointment,
    // getMyNotifications, // Removido para simplificar a tela
    // markNotificationAsRead
} from '../../assets/js/services/api.js';

// --- Estado da UI ---
let isEditing = false;
let currentUser = null; // Guardará os dados do usuário logado

// --- Seletores de Elementos ---
const profilePhoto = document.getElementById('profile-photo');
const photoInput = document.getElementById('photo-input');
const uploadMessage = document.getElementById('upload-message');
const profileName = document.getElementById('profile-name');
const profileForm = document.getElementById('profile-form');
const editBtn = document.getElementById('edit-btn');
const appointmentsListDiv = document.getElementById('appointments-list');
// const notificationsListDiv = document.getElementById('notifications-list'); // Removido

const inputs = {
    nome: document.getElementById('nome'),
    email: document.getElementById('email'),
    numeroTelefone: document.getElementById('numeroTelefone'),
    senha: document.getElementById('senha'),
    dataNascimento: document.getElementById('dataNascimento')
};

// --- Auth Guard e Carregamento Inicial ---
document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('jwt_token')) {
        window.location.href = '/login.html';
        return;
    }
    try {
        await loadProfileData();
        loadAppointments();
        // A carga de notificações foi removida para focar a página no perfil e agendamentos.
    } catch (error) {
        console.error("Falha no carregamento inicial da página de perfil:", error);
    }
});

// --- Funções de Carregamento de Dados ---

async function loadProfileData() {
    try {
        const response = await getMyProfile();
        currentUser = response.data.user;

        profileName.textContent = currentUser.nome;
        profilePhoto.src = currentUser.fotoUrl;
        
        inputs.nome.value = currentUser.nome;
        inputs.email.value = currentUser.email;
        inputs.numeroTelefone.value = currentUser.numeroTelefone || '';
        inputs.dataNascimento.value = currentUser.dataNascimento ? new Date(currentUser.dataNascimento).toISOString().split('T')[0] : '';

        // Garante que o formulário comece no modo de visualização
        toggleEditMode(false);
    } catch (error) {
        profileName.textContent = "Erro ao carregar perfil.";
    }
}

async function loadAppointments() {
    appointmentsListDiv.innerHTML = '<p>Carregando agendamentos...</p>';
    try {
        const response = await getMyAppointments();
        const appointments = response.data.appointments;

        if (appointments.length === 0) {
            appointmentsListDiv.innerHTML = '<p>Você ainda não tem agendamentos.</p>';
            return;
        }

        appointmentsListDiv.innerHTML = appointments.map(app => `
            <div class="list-item">
                <p><strong>Serviço:</strong> ${app.servico ? app.servico.nome : 'Serviço removido'}</p>
                <p><strong>Data:</strong> ${new Date(app.data).toLocaleString('pt-BR')}</p>
                <p><strong>Status:</strong> ${app.status}</p>
                ${app.status === 'pendente' || app.status === 'confirmado' ?
                    `<button class="cancel-btn" data-id="${app._id}">Cancelar Agendamento</button>` : ''
                }
            </div>
        `).join('');

    } catch (error) {
        appointmentsListDiv.innerHTML = `<p style="color: red;">Erro ao carregar agendamentos.</p>`;
    }
}

// --- Lógica de Edição do Perfil ---

function toggleEditMode(enable) {
    isEditing = enable;
    
    // Habilita/desabilita inputs. Email não é editável.
    inputs.nome.disabled = !isEditing;
    inputs.numeroTelefone.disabled = !isEditing;
    inputs.dataNascimento.disabled = !isEditing;

    // O campo de senha só é visível no modo de edição
    inputs.senha.style.display = isEditing ? 'block' : 'none';
    
    if (isEditing) {
        editBtn.textContent = 'Salvar Alterações';
        editBtn.style.backgroundColor = '#28a745'; // Verde para salvar
    } else {
        editBtn.textContent = 'Editar Informações';
        editBtn.style.backgroundColor = '#ffc107'; // Amarelo para editar
        inputs.senha.value = ''; // Limpa a senha ao sair do modo de edição
    }
}

profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return; // Não faz nada se os dados do usuário ainda não carregaram

    if (!isEditing) {
        toggleEditMode(true);
        return;
    }

    const updateData = {
        nome: inputs.nome.value,
        numeroTelefone: inputs.numeroTelefone.value,
        dataNascimento: inputs.dataNascimento.value,
    };
    
    const newPassword = inputs.senha.value;
    if (newPassword && newPassword.trim().length > 0) {
        updateData.senha = newPassword;
    }

    try {
        editBtn.disabled = true;
        editBtn.textContent = 'Salvando...';

        await updateUser(currentUser._id, updateData);

        alert('Perfil atualizado com sucesso!');
        await loadProfileData();
        toggleEditMode(false);
    } catch (error) {
        alert(`Erro ao atualizar perfil: ${error.message}`);
        editBtn.textContent = 'Salvar Alterações'; // Reverte o texto em caso de erro
    } finally {
        editBtn.disabled = false;
    }
});

// --- Lógica de Upload de Foto e Logout ---

photoInput.addEventListener('change', async () => {
    const file = photoInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('foto', file);
    
    try {
        uploadMessage.textContent = 'Enviando...';
        const response = await uploadProfilePhoto(formData);
        profilePhoto.src = response.data.user.fotoUrl;
        uploadMessage.textContent = 'Foto atualizada!';
        setTimeout(() => uploadMessage.textContent = '', 3000);
    } catch (error) {
        uploadMessage.textContent = `Erro: ${error.message}`;
    }
});



// --- Delegação de Eventos para a Lista de Agendamentos ---
document.addEventListener('click', async (event) => {
    const cancelButton = event.target.closest('.cancel-btn');

    if (cancelButton) {
        const appointmentId = cancelButton.dataset.id;
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
});