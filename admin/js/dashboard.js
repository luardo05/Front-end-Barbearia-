// File: frontend/admin/js/dashboard.js
import { getMyProfile, getDashboardSummary } from '../../assets/js/services/api.js';

const summaryDiv = document.getElementById('dashboard-summary');
const revenueChartCtx = document.getElementById('revenueChart').getContext('2d');
const appointmentsChartCtx = document.getElementById('appointmentsChart').getContext('2d');
const filterBtn = document.getElementById('filter-btn');
const resetFilterBtn = document.getElementById('reset-filter-btn');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');

// --- Variáveis para guardar as instâncias dos gráficos ---
let revenueChartInstance = null;
let appointmentsChartInstance = null;


const formatDate = (isoString) => isoString ? new Date(isoString).toLocaleString('pt-BR') : 'N/A';

// Auth Guard: Verifica se há token e se o usuário é admin
document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('jwt_token')) {
        window.location.href = '/index.html';
        return;
    }
    try {
        const profile = await getMyProfile();
        if (profile.data.user.role !== 'admin') {
            alert('Acesso negado. Apenas administradores podem acessar esta página.');
            window.location.href = '/client/home.html';
        } else {
            // Se for admin, carrega os dados da página
            loadDashboardData();
        }
    } catch (error) {
        window.location.href = '/index.html';
    }
});

// Função principal para carregar e RENDERIZAR os dados
const loadDashboardData = async () => {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    summaryDiv.innerHTML = '<p>Carregando...</p>';

    try {
        const response = await getDashboardSummary(startDate, endDate);
        const { summary, charts } = response.data;

        // --- RENDERIZAÇÃO DO RESUMO (CARDS) APRIMORADA ---
        summaryDiv.innerHTML = `
            <div class="summary-card">
                <h4>Faturamento no Período</h4>
                <p class="main-value">R$ ${summary.totalRevenue.toFixed(2)}</p>
                <p class="detail positive">(+) Ativos: <span class="detail-value">R$ ${summary.receitaBruta.toFixed(2)}</span></p>
                <p class="detail negative">(-) Estornos: <span class="detail-value">R$ ${summary.totalEstornos.toFixed(2)}</span></p>
            </div>
            <div class="summary-card">
                <h4>Taxa de Faturamento</h4>
                <p class="detail">Online: <span class="detail-value">${summary.revenuePercentage.online}%</span></p>
                <p class="detail">Presencial: <span class="detail-value">${summary.revenuePercentage.presencial}%</span></p>
            </div>
            <div class="summary-card">
                <h4>Agendamentos no Período</h4>
                <p class="detail"><strong>Total:</strong> <span class="detail-value">${summary.appointmentCounts.total}</span></p>
                <p class="detail"><strong>Concluídos:</strong> <span class="detail-value">${summary.appointmentCounts.concluido}</span></p>
                <p class="detail"><strong>Cancelados:</strong> <span class="detail-value">${summary.appointmentCounts.cancelado}</span></p>
                <p class="detail"><strong>Pendentes:</strong> <span class="detail-value">${summary.appointmentCounts.pendente}</span></p>
            </div>
        `;

        // 2. Renderiza o Gráfico de Faturamento
        // Destrói o gráfico antigo antes de criar um novo para evitar sobreposição
        if (revenueChartInstance) {
            revenueChartInstance.destroy();
        }
        revenueChartInstance = new Chart(revenueChartCtx, {
            type: 'bar', // ou 'line'
            data: {
                labels: charts.labels,
                datasets: [{
                    label: 'Faturamento',
                    data: charts.revenue,
                    backgroundColor: 'rgba(255, 211, 0, 0.6)', // Amarelo
                    borderColor: 'rgba(255, 211, 0, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                // --- OPÇÕES DE RESPONSIVIDADE ADICIONADAS ---
                responsive: true, // Garante que o gráfico se redimensione com a janela
                maintainAspectRatio: false, // Permite que o gráfico preencha a altura do contêiner que definimos no CSS
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // 3. Renderiza o Gráfico de Agendamentos
        if (appointmentsChartInstance) {
            appointmentsChartInstance.destroy();
        }
        appointmentsChartInstance = new Chart(appointmentsChartCtx, {
            type: 'line', // ou 'bar'
            data: {
                labels: charts.labels,
                datasets: [{
                    label: 'Novos Agendamentos',
                    data: charts.appointments,
                    backgroundColor: 'rgba(18, 18, 18, 0.6)', // Preto
                    borderColor: 'rgba(18, 18, 18, 1)',
                    borderWidth: 1,
                    fill: true
                }]
            },
            options: {
                // --- OPÇÕES DE RESPONSIVIDADE ADICIONADAS ---
                responsive: true, // Garante que o gráfico se redimensione com a janela
                maintainAspectRatio: false, // Permite que o gráfico preencha a altura do contêiner que definimos no CSS
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (error) {
        summaryDiv.innerHTML = `<p style="color: red;">Erro ao carregar dados do dashboard.</p>`;
    }
};

// --- Event Listeners ---
// Botão de filtrar
filterBtn.addEventListener('click', () => {
    if (!startDateInput.value || !endDateInput.value) {
        alert('Por favor, selecione a data de início e a data de fim.');
        return;
    }
    loadDashboardData();
});

// Botão de limpar filtro
resetFilterBtn.addEventListener('click', () => {
    startDateInput.value = '';
    endDateInput.value = '';
    loadDashboardData(); // Carrega com o período padrão (últimos 7 dias)
});
