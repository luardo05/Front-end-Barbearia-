// File: frontend/admin/js/gerenciarDisponibilidade.js
import { getMyProfile, getAvailabilityForMonth, setAvailability } from '../../assets/js/services/api.js';

// --- Variável de Estado Global ---
let currentDate = new Date();
let pressTimer = null; // Timer para a detecção do toque longo

// --- LÓGICA PRINCIPAL EXECUTADA APÓS O HTML CARREGAR ---
document.addEventListener('DOMContentLoaded', async () => {

    // --- Seletores de Elementos ---
    const calendarContainer = document.getElementById('calendar-container');
    const monthYearSpan = document.getElementById('current-month-year');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');

    // --- Auth Guard ---
    if (!localStorage.getItem('jwt_token')) {
        window.location.href = '/index.html';
        return;
    }
    try {
        const profile = await getMyProfile();
        if (profile.data.user.role !== 'admin') {
            alert('Acesso negado.');
            window.location.href = '/client/home.html';
        } else {
            initializeCalendar();
        }
    } catch (error) {
        window.location.href = '/index.html';
    }

    /**
     * Inicializa o calendário e adiciona todos os event listeners.
     */
    function initializeCalendar() {
        // Listeners de navegação de mês
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate);
        });

        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar(currentDate);
        });

        // --- LISTENERS DE INTERAÇÃO (TOQUE E CLIQUE) ---

        // Inicia o timer no começo do toque
        calendarContainer.addEventListener('touchstart', (e) => {
            const dayCell = e.target.closest('.day-cell.disponivel');
            if (!dayCell) return;

            pressTimer = window.setTimeout(() => {
                e.preventDefault();
                const date = dayCell.dataset.date;
                console.log(`Long press detectado em: ${date}`);
                window.location.href = `editar-dia.html?date=${date}`;
            }, 600); // 600ms para ser considerado um "long press"
        });

        // Cancela o timer se o toque terminar antes do tempo
        calendarContainer.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });

        // Cancela o timer se o usuário mover o dedo (scroll)
        calendarContainer.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });

        // Listener de CLIQUE (para desktops e toques rápidos em mobile)
        // --- LISTENER DE CLIQUE CORRIGIDO E SIMPLIFICADO ---
        calendarContainer.addEventListener('click', async (e) => {
            // 1. Verifica se o clique foi no botão/link de "Editar"
            if (e.target.closest('.edit-slots-btn')) {
                // Se foi, não fazemos NADA. Deixamos o link (<a>) fazer seu trabalho
                // de navegar para a página de edição.
                console.log("Clique no botão de editar, navegação padrão permitida.");
                return; 
            }

            // 2. Se não foi no botão de editar, verifica se foi em uma célula de dia
            const dayCell = e.target.closest('.day-cell');
            if (dayCell) {
                // Se foi, executa a lógica de alternar o status do dia.
                const date = dayCell.dataset.date;
                if (!date) return; // Ignora células vazias

                console.log("Clique na célula do dia, alternando status...");
                const isDisponivel = dayCell.classList.contains('disponivel');
                const newStatus = isDisponivel ? 'indisponivel' : 'disponivel';
                const defaultSlots = [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }];

                try {
                    // Previne que o usuário clique de novo enquanto a API está rodando
                    calendarContainer.style.pointerEvents = 'none'; 
                    await setAvailability({
                        date: date,
                        status: newStatus,
                        slots: newStatus === 'disponivel' ? defaultSlots : []
                    });
                    await renderCalendar(currentDate); // Espera a renderização terminar
                } catch (error) {
                    alert(`Erro ao atualizar o dia: ${error.message}`);
                } finally {
                    // Reabilita os cliques após a operação
                    calendarContainer.style.pointerEvents = 'auto';
                }
            }
        });

        // Carrega o calendário pela primeira vez.
        renderCalendar(currentDate);
    }

    /**
     * Renderiza o calendário para o mês e ano da data fornecida.
     */
    async function renderCalendar(date) {
        calendarContainer.innerHTML = '<p>Carregando calendário...</p>';
        const year = date.getFullYear();
        const month = date.getMonth();

        monthYearSpan.textContent = `${date.toLocaleString('pt-BR', { month: 'long' })} de ${year}`;

        try {
            const response = await getAvailabilityForMonth(year, month + 1);
            const monthConfig = response.data.availabilities;
            const availabilityMap = new Map(monthConfig.map(dayInfo => [
                new Date(dayInfo.date).toISOString().split('T')[0],
                dayInfo
            ]));

            calendarContainer.innerHTML = '';
            ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(day => {
                const dayHeader = document.createElement('div');
                dayHeader.textContent = day;
                dayHeader.classList.add('calendar-header');
                calendarContainer.appendChild(dayHeader);
            });

            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let i = 0; i < firstDayOfMonth; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.classList.add('day-cell', 'empty');
                calendarContainer.appendChild(emptyCell);
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('div');
                dayCell.classList.add('day-cell');
                
                const dayDate = new Date(Date.UTC(year, month, day));
                const dateString = dayDate.toISOString().split('T')[0];
                dayCell.dataset.date = dateString;

                const dayConfig = availabilityMap.get(dateString);
                let status = (dayDate.getUTCDay() === 0) ? 'indisponivel' : 'disponivel';
                if(dayConfig) {
                    status = dayConfig.status;
                }
                
                dayCell.innerHTML = `<span class="day-number">${day}</span>`;
                dayCell.classList.add(status);

                if (status === 'disponivel') {
                    const editLink = document.createElement('a');
                    editLink.href = `editar-dia.html?date=${dateString}`;
                    editLink.classList.add('edit-slots-btn');
                    editLink.textContent = 'Editar';
                    dayCell.appendChild(editLink);
                }
                
                calendarContainer.appendChild(dayCell);
            }

        } catch (error) {
            calendarContainer.innerHTML = `<p style="color: red;">Erro ao carregar calendário: ${error.message}</p>`;
        }
    }
});