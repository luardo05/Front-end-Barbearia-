// File: frontend/assets/js/auth/login.js
import { loginUser, getMyProfile } from '../services/api.js';

const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');
const loginBtn = document.getElementById('login-btn');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Melhora de UX: desabilita o botão e mostra feedback
    loginBtn.disabled = true;
    loginBtn.textContent = 'Entrando...';
    messageDiv.textContent = ''; // Limpa mensagens antigas

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        // 1. Faz o login e obtém o token
        const loginResponse = await loginUser({ email, senha });
        const token = loginResponse.token;

        if (!token) {
            throw new Error('Token não recebido.');
        }
        
        // 2. Salva o token no localStorage
        localStorage.setItem('jwt_token', token);

        // 3. Busca os dados do perfil para saber para onde redirecionar
        const profileResponse = await getMyProfile();
        const userRole = profileResponse.data.user.role;

        messageDiv.classList.remove('error');
        messageDiv.classList.add('success');
        messageDiv.textContent = `Login bem-sucedido! Redirecionando...`;

        // 4. Redireciona com base no role
        setTimeout(() => {
            if (userRole === 'admin') {
                window.location.href = '/admin/home.html';
            } else {
                // Para o cliente, vamos para a home dele, que deve ser a de serviços
                window.location.href = '/client/home.html'; 
            }
        }, 1500);

    } catch (error) {
        localStorage.removeItem('jwt_token');
        messageDiv.classList.remove('success');
        messageDiv.classList.add('error');
        messageDiv.textContent = error.message;

        // Reabilita o botão em caso de erro
        loginBtn.disabled = false;
        loginBtn.textContent = 'Entrar';
    }
});