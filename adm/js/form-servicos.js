import { createService, uploadServiceImage } from '../../assets/js/services/api.js';

const serviceForm = document.getElementById('service-form');

serviceForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const serviceData = {
    nome: document.getElementById('nome').value,
    descricao: document.getElementById('descricao').value,
    precoBase: parseFloat(document.getElementById('precoBase').value),
    duracaoEmMinutos: parseInt(document.getElementById('duracao').value)
  };

  const imageFile = document.getElementById('imagem').files[0];

  try {
    const savedService = await createService(serviceData);
    if (imageFile) {
      const formData = new FormData();
      formData.append('imagem', imageFile);
      await uploadServiceImage(savedService.data.service._id, formData);
    }

    alert('Serviço criado com sucesso!');
    window.location.href = "gerenciar-servicos.html"; // ou cortes.html
  } catch (err) {
    alert(`Erro ao criar serviço: ${err.message}`);
  }
});
