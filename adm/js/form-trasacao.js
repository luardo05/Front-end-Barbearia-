// File: frontend/assets/js/form-servicos.js
import { getMyProfile, createTransaction } from '../../assets/js/services/api.js';

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
        }
    } catch (error) {
        window.location.href = '/login.html';
    }
});

// Selecionando o formulário pelo ID
const transactionForm = document.getElementById('transaction-form');
const messageDiv = document.getElementById('message');

transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const transactionData = {
        // Selecionando os inputs pelos IDs corretos
        valor: parseFloat(document.getElementById('valor').value),
        descricao: document.getElementById('descricao').value,
        tipo: 'presencial' // Fixo, pois esta tela é para isso
    };
    try {
        messageDiv.textContent = 'Registrando...';
        await createTransaction(transactionData);
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Transação registrada com sucesso!';
        transactionForm.reset();
    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = `Erro: ${error.message}`;
    }
});