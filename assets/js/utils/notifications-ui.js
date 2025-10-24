// File: frontend/assets/js/utils/notifications-ui.js

/**
 * Cria e exibe uma notificação estilo "toast" no canto da tela.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - O tipo de notificação ('success', 'error', 'info').
 */
export function showToast(message, type = 'info') {
    // Cria o elemento do toast
    const toast = document.createElement('div');
    toast.textContent = message;

    // Estilização básica (pode ser melhorada no seu CSS)
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '15px';
    toast.style.borderRadius = '5px';
    toast.style.color = 'white';
    toast.style.zIndex = '1000';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s ease';

    if (type === 'success') {
        toast.style.backgroundColor = '#28a745'; // Verde
    } else if (type === 'error') {
        toast.style.backgroundColor = '#dc3545'; // Vermelho
    } else {
        toast.style.backgroundColor = '#17a2b8'; // Azul
    }

    // Adiciona o toast ao corpo do documento
    document.body.appendChild(toast);

    // Animação de fade-in
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 100);

    // Remove o toast após 5 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 500); // Espera a animação de fade-out terminar
    }, 10000);
}