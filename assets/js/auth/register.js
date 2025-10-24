// File: frontend/assets/js/auth/register.js
import { registerUser } from '../services/api.js';

const registerForm = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');
const registerBtn = document.getElementById('register-btn');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    registerBtn.disabled = true;
    registerBtn.textContent = 'Registrando...';
    messageDiv.textContent = ''; // Limpa mensagens antigas

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const dataNascimento = document.getElementById('dataNascimento').value;

    const userData = { nome, email, senha, dataNascimento };
    // Por padrão, todos os novos registros são 'cliente'.
    // A criação de admins será feita apenas pelo painel de admin.

    try {
        await registerUser(userData);

        messageDiv.classList.remove('error');
        messageDiv.classList.add('success');
        messageDiv.textContent = 'Usuário registrado com sucesso! Redirecionando para o login...';
        
        // Redireciona para o login após um curto período
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 2500);

    } catch (error) {
        messageDiv.classList.remove('success');
        messageDiv.classList.add('error');
        messageDiv.textContent = error.message;

        // Reabilita o botão em caso de erro
        registerBtn.disabled = false;
        registerBtn.textContent = 'Cadastrar';
    }
});