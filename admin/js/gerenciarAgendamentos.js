// File: frontend/admin/js/gerenciarAgendamentos.js
import { getMyProfile, getAllAppointments, updateAppointmentStatus, adminCreateAppointment, getAllUsers, getAllServices } from '../../assets/js/services/api.js';

// Auth Guard
document.addEventListener('DOMContentLoaded', async () => {
    // ... (código do Auth Guard, igual ao dos outros arquivos de admin)
    // Se for admin, carrega os dados
    loadAllAppointments(1);
    populateForms();
});

const appointmentsListDiv = document.getElementById('appointments-list');
const adminAppointmentForm = document.getElementById('admin-appointment-form');

// --- VARIÁVEIS E ELEMENTOS DE PAGINAÇÃO ---
const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');
const pageInfoSpan = document.getElementById('page-info');
let currentPage = 1;
let totalPages = 1;

// Formata a data para um padrão legível
const formatDate = (isoString) => new Date(isoString).toLocaleString('pt-BR');

// Carrega e exibe todos os agendamentos
const loadAllAppointments = async (page = 1) => {
    try {
        const response = await getAllAppointments({ paginated: true, page: page, limit: 10 });
        const appointments = response.data;
        const pagination = response.pagination;

        currentPage = pagination.currentPage;
        totalPages = pagination.totalPages;
        
        if (appointments.length === 0 && currentPage === 1) {
            appointmentsListDiv.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
            document.getElementById('pagination-controls').style.display = 'none';
            return;
        }

        document.getElementById('pagination-controls').style.display = 'flex';

        // Renderiza os cards de agendamento
        appointmentsListDiv.innerHTML = appointments.map(app => `
            <div class="appointment-card">
                <p><strong>Cliente:</strong> ${app.cliente ? app.cliente.nome : 'Cliente removido'}</p>
                <p><strong>Serviço:</strong> ${app.servico ? app.servico.nome : 'Serviço removido'}</p>
                <p><strong>Data:</strong> ${new Date(app.data).toLocaleString('pt-BR')}</p>
                <div>
                    <label for="status-${app._id}" style="font-weight: bold;">Status:</label>
                    <select id="status-${app._id}" class="status-select" data-id="${app._id}">
                        <option value="pendente" ${app.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="confirmado" ${app.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
                        <option value="concluido" ${app.status === 'concluido' ? 'selected' : ''}>Concluído</option>
                        <option value="cancelado" ${app.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </div>
            </div>
        `).join('');
        
        updatePaginationControls();
    } catch (error) {
        appointmentsListDiv.innerHTML = `<p style="color: red;">Erro ao carregar agendamentos.</p>`;
    }
};

const populateForms = async () => {
    const clientSelect = document.getElementById('client-select');
    const serviceSelect = document.getElementById('service-select');
    
    clientSelect.innerHTML = '<option value="">Selecione um cliente</option>';
    serviceSelect.innerHTML = '<option value="">Selecione um serviço</option>';
    
    try {
        // --- CORREÇÃO E MELHORIA APLICADA AQUI ---
        // Chamamos a API pedindo a lista completa, não paginada
        const [usersResponse, servicesResponse] = await Promise.all([
            getAllUsers({ paginated: false }), // <--- Chamada limpa e correta
            getAllServices()
        ]);
        
        // A resposta não paginada tem a estrutura aninhada { data: { users: [...] } }
        const users = usersResponse.data;
        users.forEach(user => {
            if (user.role === 'cliente') {
                clientSelect.innerHTML += `<option value="${user._id}">${user.nome}</option>`;
            }
        });

        const services = servicesResponse.data.services;
        services.forEach(service => {
            serviceSelect.innerHTML += `<option value="${service._id}">${service.nome}</option>`;
        });

    } catch (error) {
        console.error("Erro ao popular formulários", error);
    }
};

// Delega o evento de mudança para os selects de status
appointmentsListDiv.addEventListener('change', async (e) => {
    if (e.target.classList.contains('status-select')) {
        const appointmentId = e.target.dataset.id;
        const newStatus = e.target.value;
        try {
            await updateAppointmentStatus(appointmentId, newStatus);
            alert('Status do agendamento atualizado com sucesso!');
            // Não precisa recarregar tudo, a seleção já foi atualizada visualmente
        } catch (error) {
            alert(`Erro ao atualizar status: ${error.message}`);
        }
    }
});

// Lida com a submissão do formulário de agendamento do admin
adminAppointmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const appointmentData = {
        clienteId: document.getElementById('client-select').value,
        servicoId: document.getElementById('service-select').value,
        data: new Date(document.getElementById('date-input').value).toISOString(),
    };
    try {
        await adminCreateAppointment(appointmentData);
        alert('Agendamento criado com sucesso pelo administrador!');
        adminAppointmentForm.reset();
        loadAllAppointments(); // Recarrega a lista
    } catch (error) {
        alert(`Erro ao criar agendamento: ${error.message}`);
    }
});

// --- FUNÇÃO PARA ATUALIZAR OS CONTROLES DE PAGINAÇÃO (REUTILIZADA) ---
const updatePaginationControls = () => {
    pageInfoSpan.textContent = `Página ${currentPage} de ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
};

// Event Listeners para os botões de paginação (REUTILIZADOS)
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        loadAllAppointments(currentPage - 1);
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        loadAllAppointments(currentPage + 1);
    }
});