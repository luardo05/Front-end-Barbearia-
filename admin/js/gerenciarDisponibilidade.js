// File: frontend/admin/js/gerenciarDisponibilidade.js
import { getMyProfile, getAvailabilityForMonth, setAvailability, getAvailabilityForDate } from '../../assets/js/services/api.js';

// --- Auth Guard ---
document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('jwt_token')) {
        window.location.href = '/login.html';
        return;
    }
    try {
        const profile = await getMyProfile();
        if (profile.data.user.role !== 'admin') {
            alert('Acesso negado.');
            window.location.href = '/client/index.html';
        } else {
            // Se for admin, carrega o calendário para o mês atual.
            renderCalendar(currentDate);
        }
    } catch (error) {
        window.location.href = '/login.html';
    }
});

// --- Seletores de Elementos Globais ---
const calendarDiv = document.getElementById('calendar');
const monthYearSpan = document.getElementById('current-month-year');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');

const modal = document.getElementById('slots-modal');
const modalDateSpan = document.getElementById('modal-date');
const slotsContainer = document.getElementById('slots-container');
const addSlotBtn = document.getElementById('add-slot-btn');
const saveSlotsBtn = document.getElementById('save-slots-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

let currentDate = new Date();
let currentEditingDate = null;

/**
 * Renderiza o calendário para o mês e ano da data fornecida.
 * @param {Date} date - Uma data dentro do mês a ser renderizado.
 */
async function renderCalendar(date) {
    calendarDiv.innerHTML = '<p>Carregando calendário...</p>';
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11

    monthYearSpan.textContent = `${date.toLocaleString('pt-BR', { month: 'long' })} de ${year}`;

    try {
        // Busca as configurações de disponibilidade salvas para o mês
        const response = await getAvailabilityForMonth(year, month + 1);
        const monthConfig = response.data.availabilities;

        // Limpa o calendário e adiciona os cabeçalhos dos dias da semana
        calendarDiv.innerHTML = '';
        ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.textContent = day;
            dayHeader.style.fontWeight = 'bold';
            calendarDiv.appendChild(dayHeader);
        });

        // Lógica para desenhar os dias no calendário
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Dom, 1=Seg,...
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Adiciona células vazias para os dias antes do início do mês
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDiv.appendChild(document.createElement('div'));
        }

        // Cria uma célula para cada dia do mês
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day');

            const dayDate = new Date(Date.UTC(year, month, day));
            const dateString = dayDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            dayCell.dataset.date = dateString;

            // Encontra a configuração específica para este dia
            const dayConfig = monthConfig.find(c => new Date(c.date).getUTCDate() === day);
            const status = dayConfig ? dayConfig.status : (dayDate.getDay() === 0 ? 'indisponivel' : 'disponivel'); // Padrão

            dayCell.innerHTML = `<span>${day}</span>`;
            if (status === 'disponivel') {
                dayCell.classList.add('disponivel');
                // --- MUDANÇA AQUI: O botão agora é um link ---
                const editLink = document.createElement('a');
                editLink.href = `editar-dia.html?date=${dateString}`;
                editLink.innerHTML = `<button class="edit-slots-btn">Editar Horários</button>`;
                dayCell.appendChild(editLink);
            } else {
                dayCell.classList.add('indisponivel');
            }

            calendarDiv.appendChild(dayCell);
        }

    } catch (error) {
        calendarDiv.innerHTML = `<p style="color: red;">Erro ao carregar calendário: ${error.message}</p>`;
    }
}

// --- Event Listeners de Navegação e Interação ---

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

calendarDiv.addEventListener('click', async (e) => {
    if (e.target.closest('.edit-slots-btn')) {
        return;
    }
    const dayCell = e.target.closest('.day');
    if (!dayCell) return;

    const date = dayCell.dataset.date;

    // Se clicou no dia para alternar o status
    const isDisponivel = dayCell.classList.contains('disponivel');
    const newStatus = isDisponivel ? 'indisponivel' : 'disponivel';
    const defaultSlots = [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }];

    try {
        await setAvailability({
            date: date,
            status: newStatus,
            slots: newStatus === 'disponivel' ? defaultSlots : []
        });
        renderCalendar(currentDate); // Recarrega o calendário para refletir a mudança
    } catch (error) {
        alert(`Erro ao atualizar o dia: ${error.message}`);
    }
});