import { getAllServices } from '../../assets/js/services/api.js';

// Auth Guard: se não tiver token, redireciona
if (!localStorage.getItem('jwt_token')) {
  window.location.href = './login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  const servicesListDiv = document.getElementById('services-list');
  try {
    const response = await getAllServices();
    const services = response.data.services;

    if (!services || services.length === 0) {
      servicesListDiv.innerHTML = '<p>Nenhum serviço disponível no momento.</p>';
      return;
    }

    let html = '';
    services.forEach(service => {
      html += `
        <div class="card">
          <img src="${service.imageUrl}" alt="${service.nome}" class="image">
          <div class="details">
            <span class="name">${service.nome}</span>
            <p class="description">${service.descricao || ''}</p>
            <span class="price">R$ ${service.precoBase.toFixed(2)}</span>
          </div>
          <div class="card-icons">
            <a href="agendamento.html" class="btn">Agendar</a>
          </div>
        </div>
      `;
    });

    servicesListDiv.innerHTML = html;

  } catch (error) {
    servicesListDiv.innerHTML = `<p style="color: red;">Erro ao carregar serviços: ${error.message}</p>`;
  }
});
