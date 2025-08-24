// File: frontend/admin/js/editarDia.js
import { getMyProfile, getAvailabilityForDate, setAvailability } from '../../assets/js/services/api.js';

// --- Auth Guard (essencial para proteger a página) ---
document.addEventListener('DOMContentLoaded', async () => {
    // ... (cole aqui a mesma lógica de Auth Guard das outras páginas de admin)
    // Se for admin, carrega os dados do dia.
    loadDayData();
});

const pageTitle = document.getElementById('page-title');
const slotsContainer = document.getElementById('slots-container');
const addSlotBtn = document.getElementById('add-slot-btn');
const saveDayBtn = document.getElementById('save-day-btn');

// Pega a data da URL (ex: editar-dia.html?date=2025-08-25)
const urlParams = new URLSearchParams(window.location.search);
const dateString = urlParams.get('date');

// Carrega os dados de disponibilidade do dia
async function loadDayData() {
    if (!dateString) {
        alert('Data não fornecida!');
        window.location.href = 'gerenciar-disponibilidade.html';
        return;
    }

    const formattedDate = new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    pageTitle.textContent = formattedDate;

    try {
        const response = await getAvailabilityForDate(dateString);
        const availability = response.data.availability;
        renderSlots(availability.slots);
    } catch (error) {
        alert(`Erro ao carregar dados do dia: ${error.message}`);
    }
}

// Renderiza os inputs de horário
function renderSlots(slots = []) {
    slotsContainer.innerHTML = '';
    if (slots.length === 0) {
        slotsContainer.innerHTML = '<p>Nenhum intervalo definido. O dia será considerado indisponível.</p>';
    } else {
        slots.forEach((slot, index) => {
            const slotDiv = createSlotElement(slot.start, slot.end);
            slotsContainer.appendChild(slotDiv);
        });
    }
}

// Função auxiliar para criar um elemento de intervalo de horário
function createSlotElement(startValue = '09:00', endValue = '18:00') {
    const slotDiv = document.createElement('div');
    slotDiv.className = 'slot-item';
    slotDiv.innerHTML = `
        <label>De:</label>
        <input type="time" class="start-time" value="${startValue}">
        <label>Até:</label>
        <input type="time" class="end-time" value="${endValue}">
        <button class="remove-slot-btn" style="background-color: #dc3545; color: white;">Remover</button>
    `;
    return slotDiv;
}

// --- Event Listeners ---

addSlotBtn.addEventListener('click', () => {
    const newSlot = createSlotElement();
    slotsContainer.appendChild(newSlot);
});

slotsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-slot-btn')) {
        e.target.closest('.slot-item').remove();
    }
});

saveDayBtn.addEventListener('click', async () => {
    const newSlots = [];
    const slotItems = slotsContainer.querySelectorAll('.slot-item');
    slotItems.forEach(item => {
        const start = item.querySelector('.start-time').value;
        const end = item.querySelector('.end-time').value;
        if (start && end) {
            newSlots.push({ start, end });
        }
    });

    try {
        await setAvailability({
            date: dateString,
            status: newSlots.length > 0 ? 'disponivel' : 'indisponivel',
            slots: newSlots
        });
        alert('Disponibilidade salva com sucesso!');
        window.location.href = 'gerenciar-disponibilidade.html';
    } catch (error) {
        alert(`Erro ao salvar: ${error.message}`);
    }
});