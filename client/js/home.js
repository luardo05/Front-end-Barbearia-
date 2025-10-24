// File: frontend/client/js/home.js
import { getMyProfile, getAllServices } from '../../assets/js/services/api.js';

// --- Auth Guard e Carregamento Inicial ---
document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('jwt_token')) {
        window.location.href = '/login.html';
        return;
    }
    try {
        await getMyProfile(); // Valida o token do usuário
        loadServices();
    } catch (error) {
        // Se getMyProfile falhar, o apiFetch já redireciona
        console.error("Erro de autenticação na home.", error);
    }
});

/**
 * Busca os serviços na API e os renderiza como cards na página.
 */
async function loadServices() {
    const servicesListDiv = document.getElementById('services-list');
    servicesListDiv.innerHTML = '<p>Carregando serviços...</p>';

    try {
        const response = await getAllServices();
        const services = response.data.services;

        if (!services || services.length === 0) {
            servicesListDiv.innerHTML = '<p>Nenhum serviço disponível no momento.</p>';
            return;
        }

        // Gera o HTML dos cards
        servicesListDiv.innerHTML = services.map(service => `
            <a href="agendamento.html?serviceId=${service._id}" class="card">
                <img src="${service.imageUrl}" alt="${service.nome}" class="image">
                <div class="details">
                    <span class="name">${service.nome}</span>
                    <span class="price">Preço Base: R$ ${service.precoBase.toFixed(2)}</span>
                    <span class="description">${service.descricao}</span>
                </div>
                <div class="card-button">
                    Agendar
                </div>
            </a>
        `).join('');

    } catch (error) {
        servicesListDiv.innerHTML = `<p style="color: red;">Erro ao carregar serviços: ${error.message}</p>`;
    }
}