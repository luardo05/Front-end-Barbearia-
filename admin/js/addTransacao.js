import { createTransaction } from '../../assets/js/services/api.js';
// Incluir o Auth Guard aqui também

const transactionForm = document.getElementById('transaction-form');
const messageDiv = document.getElementById('message');

transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const transactionData = {
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