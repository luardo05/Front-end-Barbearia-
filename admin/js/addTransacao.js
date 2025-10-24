// File: frontend/admin/js/addTransacao.js
import { getMyProfile, createTransaction } from '../../assets/js/services/api.js';

// --- Seletores de Elementos ---
const transactionForm = document.getElementById('transaction-form');
const messageDiv = document.getElementById('message');
const saveBtn = document.getElementById('save-btn');

// --- Auth Guard ---
document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('jwt_token')) {
        window.location.href = '/index.html';
        return;
    }
    try {
        const profile = await getMyProfile();
        if (profile.data.user.role !== 'admin') {
            alert('Acesso negado.');
            window.location.href = '/client/home.html';
        }
    } catch (error) {
        window.location.href = '/index.html';
    }
});

// --- Listener para salvar a transação ---
transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const transactionData = {
        valor: parseFloat(document.getElementById('valor').value),
        descricao: document.getElementById('descricao').value,
        tipo: 'presencial' // Fixo, pois esta tela é para isso
    };

    try {
        // Melhora de UX: desabilita o botão e mostra feedback
        saveBtn.disabled = true;
        saveBtn.textContent = 'Registrando...';
        messageDiv.textContent = '';

        await createTransaction(transactionData);
        
        messageDiv.classList.remove('error');
        messageDiv.classList.add('success');
        messageDiv.textContent = 'Transação registrada com sucesso!';
        transactionForm.reset(); // Limpa o formulário

    } catch (error) {
        messageDiv.classList.remove('success');
        messageDiv.classList.add('error');
        messageDiv.textContent = `Erro: ${error.message}`;
    } finally {
        // Garante que o botão seja reabilitado, mesmo em caso de erro
        saveBtn.disabled = false;
        saveBtn.textContent = 'Registrar Transação';
    }
});