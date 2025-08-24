import { getAllServices } from '../../assets/js/services/api.js';

// Auth Guard: simples verificação se o token existe
if (!localStorage.getItem('jwt_token')) {
    window.location.href = './login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    const servicesListDiv = document.getElementById('services-list');
    try {
        const response = await getAllServices();
        const services = response.data.services;

        if (services.length === 0) {
            servicesListDiv.innerHTML = '<p>Nenhum serviço disponível no momento.</p>';
            return;
        }

        let html = '<ul style="list-style: none; padding: 0;">';
        services.forEach(service => {
            html += `
                <li style="border: 1px solid #ccc; margin-bottom: 10px; padding: 10px;">
                    <img src="${service.imageUrl}" alt="${service.nome}" style="max-width: 100px; float: left; margin-right: 15px;">
                    <h3>${service.nome}</h3>
                    <p>${service.descricao}</p>
                    <p><strong>Preço Base:</strong> R$ ${service.precoBase.toFixed(2)}</p>
                    <div style="clear: both;"></div>
                </li>
            `;
        });
        html += '</ul>';
        servicesListDiv.innerHTML = html;

    } catch (error) {
        servicesListDiv.innerHTML = `<p style="color: red;">Erro ao carregar serviços: ${error.message}</p>`;
    }
});