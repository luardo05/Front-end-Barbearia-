// File: frontend/client/js/agendamento.js
import {
    getMyProfile,
    getAllServices,
    getDynamicPrice,
    createAppointment,
    getAvailableTimes,
    getAvailabilityForMonth
} from '../../assets/js/services/api.js';

// --- Auth Guard ---
document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('jwt_token')) {
        window.location.href = '/login.html';
        return;
    }
    try {
        await getMyProfile();
        populateServices();
    } catch (error) {
        window.location.href = '/login.html';
    }
});

// --- Seletores de Elementos ---
const serviceSelect = document.getElementById('service-select');
const summaryService = document.getElementById('summary-service');
const summaryDate = document.getElementById('summary-date');
const summaryTime = document.getElementById('summary-time');
const summaryPrice = document.getElementById('summary-price');
const openModalBtn = document.getElementById('open-modal-btn');
const confirmBtn = document.getElementById('confirm-appointment-btn');
const messageDiv = document.getElementById('message');

// Modal
const modal = document.getElementById('agendamento-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const calendarView = document.getElementById('calendar-view');
const timeView = document.getElementById('time-view');
const backToCalendarBtn = document.getElementById('back-to-calendar-btn');
const calendarNav = {
    prev: document.getElementById('prev-month-btn'),
    next: document.getElementById('next-month-btn'),
    title: document.getElementById('current-month-year'),
    calendar: document.getElementById('calendar')
};
const selectedDateSpan = document.getElementById('selected-date-span');
const timeSlotsDiv = document.getElementById('time-slots');

// --- Variáveis de Estado ---
let agendamentoState = {
    serviceId: null,
    serviceName: 'Nenhum',
    date: null,
    time: 'Nenhum',
    price: null,
};
let calendarDate = new Date();

// --- Funções de Renderização ---

function updateSummary() {
    summaryService.textContent = agendamentoState.serviceName;
    summaryDate.textContent = agendamentoState.date ? new Date(agendamentoState.date + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Nenhuma';
    summaryTime.textContent = agendamentoState.time;

    // Adiciona uma verificação. Se o preço for null, mostra um texto padrão.
    if (agendamentoState.price !== null) {
        summaryPrice.textContent = `R$ ${agendamentoState.price.toFixed(2)}`;
    } else {
        summaryPrice.textContent = 'R$ 0.00';
    }

    openModalBtn.disabled = !agendamentoState.serviceId;
    confirmBtn.disabled = !agendamentoState.serviceId || !agendamentoState.date || agendamentoState.time === 'Nenhum';
}

async function renderCalendar(date) {
    calendarNav.calendar.innerHTML = '<p>Carregando calendário...</p>';
    const year = date.getFullYear();
    const month = date.getMonth();

    calendarNav.title.textContent = `${date.toLocaleString('pt-BR', { month: 'long' })} de ${year}`;

    try {
        const response = await getAvailabilityForMonth(year, month + 1);
        // A API agora retorna um array com todos os dias do mês e seu status final
        const monthAvailability = response.data.availabilities;
        
        // Converte para um mapa para busca rápida
        const availabilityMap = new Map(monthAvailability.map(dayInfo => [
            new Date(dayInfo.date).toISOString().split('T')[0], 
            dayInfo.status
        ]));

        calendarNav.calendar.innerHTML = '';
        ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.textContent = day;
            dayHeader.style.fontWeight = 'bold';
            calendarNav.calendar.appendChild(dayHeader);
        });

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarNav.calendar.appendChild(document.createElement('div'));
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day');
            
            const dayDate = new Date(Date.UTC(year, month, day));
            const dateString = dayDate.toISOString().split('T')[0];
            dayCell.dataset.date = dateString;

            const status = availabilityMap.get(dateString) || 'indisponivel'; 
            
            dayCell.textContent = day;
            dayCell.classList.add(status);
            
            calendarNav.calendar.appendChild(dayCell);
        }

    } catch (error) {
        calendarNav.calendar.innerHTML = `<p style="color: red;">Erro ao carregar calendário.</p>`;
    }
}

async function renderTimeSlots(dateString) {
    selectedDateSpan.textContent = new Date(dateString + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    timeSlotsDiv.innerHTML = '<p>Buscando horários...</p>';
    
    try {
        const timesResponse = await getAvailableTimes(dateString, agendamentoState.serviceId);
        const availableTimes = timesResponse.data.slots;

        if (availableTimes.length === 0) {
            timeSlotsDiv.innerHTML = '<p><strong>Nenhum horário disponível para esta data.</strong></p>';
            return;
        }

        timeSlotsDiv.innerHTML = '';
        availableTimes.forEach(time => {
            const button = document.createElement('button');
            button.textContent = time;
            button.type = 'button';
            button.className = 'time-slot-btn';
            button.dataset.time = time;
            timeSlotsDiv.appendChild(button);
        });
    } catch(error) {
        timeSlotsDiv.innerHTML = `<p style="color: red;">Erro ao buscar horários: ${error.message}</p>`;
    }
}

// --- Funções de Controle de Visibilidade do Modal ---

function showCalendarView() {
    timeView.style.display = 'none';
    calendarView.style.display = 'block';
}

function showTimeView() {
    calendarView.style.display = 'none';
    timeView.style.display = 'block';
}

// --- Lógica Principal e Event Listeners ---

async function populateServices() {
    try {
        // Mostra um feedback de carregamento para o usuário.
        serviceSelect.innerHTML = '<option value="">Carregando serviços...</option>';
        
        // Chama a função da API que busca todos os serviços.
        const response = await getAllServices();
        
        // Verifica se a resposta contém os dados esperados.
        if (response && response.data && response.data.services) {
            const services = response.data.services;

            // Limpa o select e adiciona a primeira opção padrão.
            serviceSelect.innerHTML = '<option value="">Selecione um serviço</option>';

            // Itera sobre cada serviço retornado pela API.
            services.forEach(service => {
                // Cria um novo elemento <option>.
                const option = document.createElement('option');
                
                // Define o 'value' da opção como o ID do serviço (essencial para as chamadas de API).
                option.value = service._id;
                
                // Guarda a duração do serviço em um atributo 'data-*' para fácil acesso.
                option.dataset.duration = service.duracaoEmMinutos;
                
                // Define o texto visível para o usuário.
                option.textContent = `${service.nome}`;
                
                // Adiciona a nova opção ao select.
                serviceSelect.appendChild(option);
            });
        } else {
            throw new Error("Formato de resposta da API de serviços inesperado.");
        }

    } catch (error) {
        console.error("Erro ao popular serviços:", error);
        // Em caso de erro, exibe uma mensagem clara no próprio select.
        serviceSelect.innerHTML = '<option value="">Não foi possível carregar os serviços.</option>';
    }
}

serviceSelect.addEventListener('change', (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    agendamentoState.serviceId = e.target.value;
    agendamentoState.serviceName = selectedOption.textContent;
    
    // Reseta o resto do estado
    agendamentoState.date = null;
    agendamentoState.time = 'Nenhum';
    agendamentoState.price = 0.00;
    updateSummary();
});

openModalBtn.addEventListener('click', () => {
    renderCalendar(calendarDate);
    showCalendarView();
    modal.style.display = 'flex';
});

closeModalBtn.addEventListener('click', () => modal.style.display = 'none');

calendarNav.prev.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar(calendarDate);
});

calendarNav.next.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar(calendarDate);
});

// --- LISTENER DO CALENDÁRIO CORRIGIDO ---
calendarNav.calendar.addEventListener('click', async (e) => {
    const dayCell = e.target.closest('.day.disponivel');
    if (dayCell) {
        agendamentoState.date = dayCell.dataset.date;
        
        try {
            const priceResponse = await getDynamicPrice(agendamentoState.serviceId, agendamentoState.date);
            
            // Adiciona uma verificação para garantir que a resposta da API está correta
            if (priceResponse && priceResponse.data && typeof priceResponse.data.precoFinal !== 'undefined') {
                const precoInfo = priceResponse.data;
                agendamentoState.price = precoInfo.precoFinal;
            await renderTimeSlots(agendamentoState.date);
                
                } else {
                throw new Error("Resposta de preço inválida da API.");
            }
            showTimeView();
        } catch (error) {
            alert('Não foi possível obter os detalhes para este dia.');
            agendamentoState.price = null;
        }
        updateSummary();
    }
});

// --- LISTENER DA HORA CORRIGIDO ---
timeSlotsDiv.addEventListener('click', (e) => {
    const timeBtn = e.target.closest('.time-slot-btn');
    if (timeBtn) {
        agendamentoState.time = timeBtn.dataset.time;
        // Chama updateSummary aqui também para garantir que o botão de confirmar seja habilitado
        updateSummary();
        modal.style.display = 'none';
    }
});

backToCalendarBtn.addEventListener('click', showCalendarView);

confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    messageDiv.textContent = 'Agendando...';

    const appointmentData = {
        servicoId: agendamentoState.serviceId,
        data: `${agendamentoState.date}T${agendamentoState.time}:00.000Z`
    };
    
    try {
        await createAppointment(appointmentData);
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Agendamento realizado com sucesso! Você será redirecionado...';
        setTimeout(() => {
            window.location.href = '/client/perfil.html';
        }, 2000);
    } catch(error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = `Erro ao agendar: ${error.message}`;
        confirmBtn.disabled = false;
    }
});