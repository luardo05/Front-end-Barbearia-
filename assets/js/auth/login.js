// File: frontend/assets/js/auth/login.js
import { loginUser, getMyProfile } from '../services/api.js';

const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        messageDiv.textContent = 'Entrando...';

        // 1. Faz o login e obtém o token
        const loginResponse = await loginUser({ email, senha });
        const token = loginResponse.token;

        if (!token) {
            throw new Error('Token não recebido.');
        }
        
        // 2. Salva o token no localStorage
        localStorage.setItem('jwt_token', token);
        console.log('Token salvo:', token);

        // 3. Busca os dados do perfil para saber para onde redirecionar
        const profileResponse = await getMyProfile();
        const userRole = profileResponse.data.user.role;

        messageDiv.style.color = 'green';
        messageDiv.textContent = `Login bem-sucedido como ${userRole}! Redirecionando...`;

        // 4. Redireciona com base no role
        setTimeout(() => {
            if (userRole === 'admin') {
                window.location.href = '/admin/index.html';
            } else {
                window.location.href = '/client/index.html';
            }
        }, 1500);

    } catch (error) {
        localStorage.removeItem('jwt_token'); // Limpa qualquer token antigo em caso de erro
        messageDiv.style.color = 'red';
        messageDiv.textContent = `Erro no login: ${error.message}`;
    }
});