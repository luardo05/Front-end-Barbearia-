import { getAllServices, updateService, deleteService, uploadServiceImage } from '../../assets/js/services/api.js';

const servicesContainer = document.getElementById('services-container');
const serviceModal = document.getElementById('service-modal');
const deleteModal = document.getElementById('delete-modal');
const closeModal = document.getElementById('close-modal');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

const serviceForm = document.getElementById('service-form');
const formTitle = document.getElementById('form-title');
const serviceIdInput = document.getElementById('service-id');

let deleteId = null;

// Carregar serviços
document.addEventListener('DOMContentLoaded', async () => {
  if (!localStorage.getItem('jwt_token')) {
    window.location.href = '/login.html';
    return;
  }
  await loadServices();
});

async function loadServices() {
  try {
    const response = await getAllServices();
    const services = response.data.services;

    servicesContainer.innerHTML = services.map(s => `
      <div class="card">
      <img src="${s.imageUrl}" alt="${s.nome}" alt="${s.nome}" class="image">
        <div class="details">
          <span class="name">${s.nome}</span>
          <span class="price">R$ ${s.precoBase.toFixed(2)}</span>
        </div>
        <div class="actions">
          <button class="edit-btn" data-id="${s._id}"><i class="fa fa-edit"></i></button>
          <button class="delete-btn" data-id="${s._id}"><i class="fa fa-trash"></i></button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    servicesContainer.innerHTML = `<p style="color:red;">Erro ao carregar serviços</p>`;
  }
}

// Fechar modal de edição
closeModal.addEventListener('click', () => {
  serviceModal.style.display = 'none';
});
cancelEditBtn.addEventListener('click', () => {
  resetForm();
  serviceModal.style.display = 'none';
});

// Submeter edição
serviceForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const serviceData = {
    nome: document.getElementById('nome').value,
    descricao: document.getElementById('descricao').value,
    precoBase: parseFloat(document.getElementById('precoBase').value),
    duracaoEmMinutos: parseInt(document.getElementById('duracao').value)
  };

  const id = serviceIdInput.value;
  const imageFile = document.getElementById('imagem').files[0];

  try {
    const savedService = await updateService(id, serviceData);
    alert('Serviço atualizado!');

    if (imageFile) {
      const formData = new FormData();
      formData.append('imagem', imageFile);
      await uploadServiceImage(savedService.data.service._id, formData);
    }

    serviceModal.style.display = 'none';
    resetForm();
    loadServices();
  } catch (err) {
    alert(`Erro: ${err.message}`);
  }
});

// Delegação Editar / Excluir
servicesContainer.addEventListener('click', async (e) => {
  const target = e.target.closest('button');
  if (!target) return;

  const id = target.dataset.id;

  if (target.classList.contains('edit-btn')) {
    const response = await getAllServices();
    const service = response.data.services.find(s => s._id === id);
    if (service) {
      serviceIdInput.value = service._id;
      document.getElementById('nome').value = service.nome;
      document.getElementById('descricao').value = service.descricao;
      document.getElementById('precoBase').value = service.precoBase;
      document.getElementById('duracao').value = service.duracaoEmMinutos;
      formTitle.textContent = 'Editar Serviço';
      cancelEditBtn.style.display = 'inline';
      serviceModal.style.display = 'block';
    }
  }

  if (target.classList.contains('delete-btn')) {
    deleteId = id;
    deleteModal.style.display = 'block';
  }
});

// Confirmação de exclusão
document.getElementById('confirm-delete').addEventListener('click', async () => {
  if (deleteId) {
    try {
      await deleteService(deleteId);
      alert('Serviço excluído!');
      loadServices();
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
    deleteModal.style.display = 'none';
  }
});

document.getElementById('cancel-delete').addEventListener('click', () => {
  deleteId = null;
  deleteModal.style.display = 'none';
});

// Resetar formulário
function resetForm() {
  serviceForm.reset();
  serviceIdInput.value = '';
  formTitle.textContent = 'Editar Serviço';
  cancelEditBtn.style.display = 'none';
}
