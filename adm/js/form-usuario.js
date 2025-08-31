// File: frontend/assets/js/form-usuario.js
import { getMyProfile, getUserById, updateUser } from '../../assets/js/services/api.js';

// Auth Guard: Verifica se há token e se o usuário é admin
document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('jwt_token')) {
        window.location.href = '/login.html';
        return;
    }
    try {
        const profile = await getMyProfile();
        if (profile.data.user.role !== 'admin') {
            alert('Acesso negado. Apenas administradores podem acessar esta página.');
            window.location.href = '/client/index.html';
        } else {
            // Se for admin, carrega os dados da página
            loadUserData();
        }
    } catch (error) {
        window.location.href = '/login.html';
    }
});


const form = document.getElementById('edit-user-form');
const messageDiv = document.getElementById('message');
const formTitle = document.getElementById('form-title');

// Pega o ID do usuário da URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');

// Carrega os dados do usuário para preencher o formulário
const loadUserData = async () => {
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
        // Os campos do seu HTML original
        document.getElementById('cpf').value = user.cpf || '';
        document.getElementById('telefone').value = user.telefone || '';
        document.getElementById('dataNasc').value = user.dataNasc || '';
        document.getElementById('fotoPerfil').value = user.fotoPerfil || '';
    } catch (error) {
        alert(`Erro ao carregar usuário: ${error.message}`);
    }
};

// Listener para salvar as alterações
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const updateData = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
        cpf: document.getElementById('cpf').value,
        telefone: document.getElementById('telefone').value,
        dataNasc: document.getElementById('dataNasc').value,
        fotoPerfil: document.getElementById('fotoPerfil').value,
    };

    const newPassword = document.getElementById('senha').value;
    // Só adiciona a senha ao objeto de atualização se ela não estiver vazia
    if (newPassword) {
        updateData.senha = newPassword;
    }

    try {
        messageDiv.textContent = 'Salvando...';
        messageDiv.style.color = '#000'; // Cor padrão
        await updateUser(userId, updateData);
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Usuário atualizado com sucesso!';
    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = `Erro: ${error.message}`;
    }
});