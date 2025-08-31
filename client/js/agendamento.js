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
    title: document.getElementById('current-month-year')
};
const calendarDays = document.getElementById('calendar-days');
const selectedDateSpan = document.getElementById('selected-date-span');
const timeSlotsDiv = document.getElementById('time-slots');
const priceDisplay = document.getElementById('price-display');

// --- Variáveis de Estado ---
let agendamentoState = {
    serviceId: null,
    serviceName: 'Nenhum',
    date: null,
    time: 'Nenhum',
    price: 0.00
};
let calendarDate = new Date();

// --- Funções de Renderização ---

function updateSummary() {
    summaryService.textContent = agendamentoState.serviceName;
    summaryDate.textContent = agendamentoState.date ? new Date(agendamentoState.date + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Nenhuma';
    summaryTime.textContent = agendamentoState.time;
    summaryPrice.textContent = `R$ ${agendamentoState.price.toFixed(2)}`;

    openModalBtn.disabled = !agendamentoState.serviceId;
    confirmBtn.disabled = !agendamentoState.serviceId || !agendamentoState.date || agendamentoState.time === 'Nenhum';
}

async function renderCalendar(date) {
    calendarDays.innerHTML = '<p>Carregando...</p>';
    const year = date.getFullYear();
    const month = date.getMonth();

    calendarNav.title.textContent = `${date.toLocaleString('pt-BR', { month: 'long' })} de ${year}`;

    try {
        const response = await getAvailabilityForMonth(year, month + 1);
        const monthAvailability = response.data.availabilities;
        const availabilityMap = new Map(monthAvailability.map(dayInfo => [
            new Date(dayInfo.date).toISOString().split('T')[0], dayInfo.status
        ]));

        calendarDays.innerHTML = '';
        ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.textContent = day;
            dayHeader.classList.add('day-header');
            calendarDays.appendChild(dayHeader);
        });

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day');
            calendarDays.appendChild(emptyCell);
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
            calendarDays.appendChild(dayCell);
        }
    } catch (error) {
        calendarDays.innerHTML = `<p style="color: red;">Erro ao carregar calendário.</p>`;
    }
}

async function renderTimeSlots(dateString) {
    selectedDateSpan.textContent = new Date(dateString + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    timeSlotsDiv.innerHTML = '<p>Buscando horários...</p>';
    
    try {
        const timesResponse = await getAvailableTimes(dateString, agendamentoState.serviceId);
        const availableTimes = timesResponse.data.slots;
        timeSlotsDiv.innerHTML = ''; // Limpa antes de adicionar

        if (availableTimes.length === 0) {
            timeSlotsDiv.innerHTML = '<p><strong>Nenhum horário disponível para esta data.</strong></p>';
            return;
        }

        const manha = availableTimes.filter(t => parseInt(t.split(':')[0]) < 12);
        const tarde = availableTimes.filter(t => parseInt(t.split(':')[0]) >= 12 && parseInt(t.split(':')[0]) < 18);
        const noite = availableTimes.filter(t => parseInt(t.split(':')[0]) >= 18);

        const createButtons = (times) => {
            times.forEach(time => {
                const button = document.createElement('button');
                button.textContent = time;
                button.type = 'button';
                button.className = 'time-slot-btn';
                button.dataset.time = time;
                timeSlotsDiv.appendChild(button);
            });
        };

        if (manha.length > 0) { timeSlotsDiv.innerHTML += '<p>Manhã</p>'; createButtons(manha); }
        if (tarde.length > 0) { timeSlotsDiv.innerHTML += '<p>Tarde</p>'; createButtons(tarde); }
        if (noite.length > 0) { timeSlotsDiv.innerHTML += '<p>Noite</p>'; createButtons(noite); }

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
        const response = await getAllServices();
        serviceSelect.innerHTML = '<option value="">Selecione um serviço</option>';
        response.data.services.forEach(service => {
            const option = document.createElement('option');
            option.value = service._id;
            option.textContent = service.nome;
            serviceSelect.appendChild(option);
        });
    } catch (error) {
        serviceSelect.innerHTML = '<option value="">Erro ao carregar serviços</option>';
    }
}

serviceSelect.addEventListener('change', (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    agendamentoState.serviceId = e.target.value;
    agendamentoState.serviceName = selectedOption.textContent;
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

calendarDays.addEventListener('click', async (e) => {
    const dayCell = e.target.closest('.day.disponivel');
    if (dayCell) {
        agendamentoState.date = dayCell.dataset.date;
        try {
            const priceResponse = await getDynamicPrice(agendamentoState.serviceId, agendamentoState.date);
            const precoInfo = priceResponse.data;
            agendamentoState.price = precoInfo.precoFinal;
            
            let priceHtml = `<p><strong>Preço:</strong> R$ ${precoInfo.precoOriginal.toFixed(2)}</p>`;
            if (precoInfo.desconto.amount > 0) {
                priceHtml += `<p style="color: green;"><strong>${precoInfo.desconto.reason}:</strong> -R$ ${precoInfo.desconto.amount.toFixed(2)}</p>`;
            }
            priceHtml += `<h4>Total: R$ ${precoInfo.precoFinal.toFixed(2)}</h4>`;
            priceDisplay.innerHTML = priceHtml;
            
            await renderTimeSlots(agendamentoState.date);
            showTimeView();
        } catch (error) {
            alert('Não foi possível obter os detalhes para este dia.');
        }
    }
});

timeSlotsDiv.addEventListener('click', (e) => {
    const timeBtn = e.target.closest('.time-slot-btn');
    if(timeBtn) {
        document.querySelectorAll('.time-slot-btn').forEach(btn => btn.classList.remove('selected'));
        timeBtn.classList.add('selected');
        agendamentoState.time = timeBtn.dataset.time;
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