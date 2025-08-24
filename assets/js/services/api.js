const BASE_URL = 'http://localhost:3000/api/v1';

const getToken = () => localStorage.getItem('jwt_token');

const apiFetch = async (endpoint, method = 'GET', body = null) => {
    const headers = new Headers({
        'Content-Type': 'application/json'
    });

    const token = getToken();
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        
        // Se a resposta não tiver corpo (como no 204 No Content), retorne um sucesso genérico
        if (response.status === 204) {
            return { status: 'success', data: null };
        }

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('jwt_token');
                alert('Sessão expirada. Por favor, faça login novamente.');
                window.location.href = '../../../login.html';
            }
            throw new Error(data.message || 'Ocorreu um erro na API');
        }
        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        alert(error.message); // Mostra o erro para o usuário
        throw error;
    }
};

const apiUpload = async (endpoint, formData) => {
    const headers = new Headers();
    const token = getToken();
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }

    const options = {
        method: 'PATCH', // ou o método que você definir na rota
        headers,
        body: formData, // Envia o FormData diretamente
    };
    // IMPORTANTE: Não defina 'Content-Type'. O navegador fará isso automaticamente
    // para multipart/form-data e incluirá o 'boundary' correto.

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Erro no upload');
        }
        return data;
    } catch (error) {
        console.error(`API Upload Error (${endpoint}):`, error);
        alert(error.message);
        throw error;
    }
};

// --- Auth API ---
export const registerUser = (userData) => apiFetch('/auth/register', 'POST', userData);
export const loginUser = (credentials) => apiFetch('/auth/login', 'POST', credentials);
export const getMyProfile = () => apiFetch('/auth/me');

// --- Services API (Público) ---
export const getAllServices = () => apiFetch('/services');
export const getDynamicPrice = (serviceId, date) => apiFetch(`/services/${serviceId}/price?date=${date}`);

// --- Appointments API (Cliente Logado) ---
export const createAppointment = (appointmentData) => apiFetch('/appointments', 'POST', appointmentData);
export const getMyAppointments = () => apiFetch('/appointments/my-appointments');
export const cancelMyAppointment = (appointmentId) => apiFetch(`/appointments/${appointmentId}/cancel`, 'PATCH');

// --- Notifications API (Cliente Logado) ---
export const getMyNotifications = (page = 1, limit = 10) => apiFetch(`/notifications?page=${page}&limit=${limit}`);
export const markNotificationAsRead = (notificationId) => apiFetch(`/notifications/${notificationId}/read`, 'PATCH');

// --- Availability API ---
// Para o admin ver o calendário (ex: ?year=2025&month=8)
export const getAvailabilityForMonth = (year, month) => apiFetch(`/availability/month?year=${year}&month=${month}`);

// Para o admin ou cliente ver os detalhes de um dia
export const getAvailabilityForDate = (date) => apiFetch(`/availability/day?date=${date}`);

// Para o admin salvar a configuração de um dia
export const setAvailability = (availabilityData) => apiFetch('/availability', 'POST', availabilityData);

// --- ATUALIZAÇÃO na DisponibilidadeService API ---
// A rota para buscar horários agora também precisa do ID do serviço
export const getAvailableTimes = (date, serviceId) => apiFetch(`/availability/slots?date=${date}&serviceId=${serviceId}`);

// --- Services API (Admin) ---
export const createService = (serviceData) => apiFetch('/services', 'POST', serviceData);
export const updateService = (id, serviceData) => apiFetch(`/services/${id}`, 'PATCH', serviceData);
export const deleteService = (id) => apiFetch(`/services/${id}`, 'DELETE');
// a função getAllServices já existe e é pública

// --- Appointments API (Admin) ---
export const getAllAppointments = (options = { paginated: true, page: 1, limit: 10 }) => {
    if (options.paginated) {
        return apiFetch(`/appointments?page=${options.page}&limit=${options.limit}`);
    } else {
        return apiFetch(`/appointments?paginated=false`);
    }
};
export const updateAppointmentStatus = (id, status) => apiFetch(`/appointments/${id}/status`, 'PATCH', { status });
export const adminCreateAppointment = (appointmentData) => apiFetch('/appointments/admin-create', 'POST', appointmentData);

// --- Users API (Admin) ---
export const getAllUsers = (options = { paginated: true, page: 1, limit: 10 }) => {
    if (options.paginated) {
        return apiFetch(`/users?page=${options.page}&limit=${options.limit}`);
    } else {
        // Se não for paginado, busca todos
        return apiFetch(`/users?paginated=false`);
    }
};
export const getUserById = (id) => apiFetch(`/users/${id}`);
export const updateUser = (id, userData) => apiFetch(`/users/${id}`, 'PATCH', userData);
export const adminCreateUser = (userData) => apiFetch('/users', 'POST', userData);
export const deleteUser = (id) => apiFetch(`/users/${id}`, 'DELETE');

// --- Transactions API (Admin) ---
export const createTransaction = (transactionData) => apiFetch('/transactions', 'POST', transactionData);

// --- Dashboard API (Admin) ---
export const getDashboardSummary = (startDate, endDate) => {
    let endpoint = '/dashboard/summary';
    if (startDate && endDate) {
        endpoint += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return apiFetch(endpoint);
};

export const uploadProfilePhoto = (formData) => apiUpload('/users/updateMyPhoto', formData);
export const uploadServiceImage = (id, formData) => apiUpload(`/services/${id}/image`, formData);