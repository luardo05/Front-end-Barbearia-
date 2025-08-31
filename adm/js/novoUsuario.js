// File: frontend/admin/js/novoUsuario.js
import { adminCreateUser } from '../../assets/js/services/api.js';

const form = document.getElementById('add-user-form');
const message = document.getElementById('form-message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userData = {
    nome: document.getElementById('nome').value,
    email: document.getElementById('email').value,
    senha: document.getElementById('senha').value,
    dataNascimento: document.getElementById('dataNascimento').value,
    role: document.getElementById('role').value,
  };

  try {
    message.textContent = 'Adicionando...';
    await adminCreateUser(userData);
    message.style.color = 'green';
    message.textContent = 'Usuário criado com sucesso!';
    form.reset();
  } catch (error) {
    message.style.color = 'red';
    message.textContent = `Erro: ${error.message}`;
  }
});
