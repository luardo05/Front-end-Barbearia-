import { registerUser } from '../services/api.js';

const registerForm = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const dataNascimento = document.getElementById('dataNascimento').value;
    const isAdmin = document.getElementById('isAdmin').checked;

    const userData = { nome, email, senha, dataNascimento };
    
    // Adiciona o role se o checkbox for marcado
    if (isAdmin) {
        userData.role = 'admin';
    }

    try {
        messageDiv.textContent = 'Registrando...';
        await registerUser(userData);

        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Usuário registrado com sucesso! Redirecionando para o login...';
        
        setTimeout(() => {
            window.location.href = '../../../login.html';
        }, 2000);

    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = `Erro no registro: ${error.message}`;
    }
});