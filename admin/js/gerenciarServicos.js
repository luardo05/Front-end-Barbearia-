// File: frontend/admin/js/dashboard.js
import { getMyProfile, getAllServices, createService, updateService, deleteService, uploadServiceImage } from '../../assets/js/services/api.js';

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
            loadServices();
        }
    } catch (error) {
        window.location.href = '/login.html';
    }
});

const serviceForm = document.getElementById('service-form');
const servicesListDiv = document.getElementById('services-list');
const formTitle = document.getElementById('form-title');
const serviceIdInput = document.getElementById('service-id');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// Carrega e exibe a lista de serviços
const loadServices = async () => {
    try {
        const response = await getAllServices();
        const services = response.data.services;
        servicesListDiv.innerHTML = '<ul>' + services.map(s => `
            <li>
            <img src="${s.imageUrl}" alt="${s.nome}" style="width: 50px; vertical-align: middle; margin-right: 10px;">
                ${s.nome} - R$ ${s.precoBase.toFixed(2)}
                <button class="edit-btn" data-id="${s._id}">Editar</button>
                <button class="delete-btn" data-id="${s._id}">Excluir</button>
            </li>
        `).join('') + '</ul>';
    } catch (error) {
        servicesListDiv.innerHTML = `<p style="color: red;">Erro ao carregar serviços.</p>`;
    }
};

// Lida com a submissão do formulário (Criar ou Atualizar)
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
        let savedService;
        if (id) {
            savedService = await updateService(id, serviceData);
            alert('Dados do serviço atualizados!');
        } else {
            savedService = await createService(serviceData);
            alert('Serviço criado com sucesso!');
        }

        // Se uma imagem foi selecionada, faz o upload dela
        if (imageFile) {
            const formData = new FormData();
            formData.append('imagem', imageFile);
            // Usa o ID do serviço recém-criado ou atualizado
            await uploadServiceImage(savedService.data.service._id, formData);
            alert('Imagem do serviço enviada com sucesso!');
        }

        resetForm();
        loadServices();
    } catch (error) {
        alert(`Erro ao salvar serviço: ${error.message}`);
    }
});

// Delega eventos para os botões de editar e excluir
servicesListDiv.addEventListener('click', async (e) => {
    const target = e.target;
    const id = target.dataset.id;

    if (target.classList.contains('delete-btn')) {
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            try {
                await deleteService(id);
                alert('Serviço excluído com sucesso!');
                loadServices();
            } catch (error) {
                alert(`Erro ao excluir: ${error.message}`);
            }
        }
    }

    if (target.classList.contains('edit-btn')) {
        // Busca o serviço completo para preencher o formulário
        const response = await getAllServices(); // Simples, mas poderia ser um getById
        const service = response.data.services.find(s => s._id === id);
        if (service) {
            formTitle.textContent = 'Editar Serviço';
            serviceIdInput.value = service._id;
            document.getElementById('nome').value = service.nome;
            document.getElementById('descricao').value = service.descricao;
            document.getElementById('precoBase').value = service.precoBase;
            document.getElementById('duracao').value = service.duracaoEmMinutos;
            cancelEditBtn.style.display = 'inline';
        }
    }
});

// Botão para cancelar o modo de edição
cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
    serviceForm.reset();
    serviceIdInput.value = '';
    formTitle.textContent = 'Adicionar Novo Serviço';
    cancelEditBtn.style.display = 'none';
}