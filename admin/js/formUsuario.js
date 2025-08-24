// File: frontend/admin/js/formUsuario.js
import { getMyProfile, getUserById, updateUser } from '../../assets/js/services/api.js';

// Auth Guard... (coloque aqui a mesma lógica de verificação de admin)

const form = document.getElementById('edit-user-form');
const messageDiv = document.getElementById('message');
const formTitle = document.getElementById('form-title');

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
    // Só adiciona a senha ao objeto de atualização se ela não estiver vazia
    if (newPassword) {
        updateData.senha = newPassword;
    }

    try {
        messageDiv.textContent = 'Salvando...';
        await updateUser(userId, updateData);
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Usuário atualizado com sucesso!';
    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = `Erro: ${error.message}`;
    }
});