// File: frontend/admin/js/formUsuario.js
import { getMyProfile, getUserById, updateUser } from '../../assets/js/services/api.js';

// Auth Guard... (coloque aqui a mesma lógica de verificação de admin)

const form = document.getElementById('edit-user-form');
const messageDiv = document.getElementById('message');
const formTitle = document.getElementById('form-title');
const saveBtn = document.getElementById('save-btn');

// Pega o ID do usuário da URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');

// Carrega os dados do usuário para preencher o formulário
document.addEventListener('DOMContentLoaded', async () => {
    if (!userId) {
        alert('ID do usuário não fornecido!');
        window.location.href = 'gerenciar-usuarios.html';
        return;
    }

    try {
        const response = await getUserById(userId);
        const user = response.data.user;
        
        formTitle.textContent = `Editar Usuário: ${user.nome}`;
        document.getElementById('nome').value = user.nome;
        document.getElementById('email').value = user.email;
        document.getElementById('role').value = user.role;
    } catch (error) {
        alert(`Erro ao carregar usuário: ${error.message}`);
    }
});

// Listener para salvar as alterações
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const updateData = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
    };

    const newPassword = document.getElementById('senha').value;
    if (newPassword && newPassword.trim().length > 0) {
        updateData.senha = newPassword;
    }

    try {
        // Melhora de UX: desabilita o botão e mostra feedback
        saveBtn.disabled = true;
        saveBtn.textContent = 'Salvando...';
        messageDiv.textContent = '';

        await updateUser(userId, updateData);

        messageDiv.classList.remove('error');
        messageDiv.classList.add('success');
        messageDiv.textContent = 'Usuário atualizado com sucesso!';
        
        // Limpa o campo de senha após o sucesso
        document.getElementById('senha').value = '';

    } catch (error) {
        messageDiv.classList.remove('success');
        messageDiv.classList.add('error');
        messageDiv.textContent = `Erro: ${error.message}`;
    } finally {
        // Garante que o botão seja reabilitado, mesmo em caso de erro
        saveBtn.disabled = false;
        saveBtn.textContent = 'Salvar Alterações';
    }
});