const API_BASE = '/api';

async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || data.message || 'Something went wrong');
    }
    return data;
}

// Provider endpoints
export async function getProviders(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set('q', params.q);
    if (params.specialty) searchParams.set('specialty', params.specialty);

    const queryString = searchParams.toString();
    const url = `${API_BASE}/providers${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url);
    return handleResponse(response);
}

export async function getProvider(id) {
    const response = await fetch(`${API_BASE}/providers/${id}`);
    return handleResponse(response);
}

export async function getProviderSlots(providerId, params = {}) {
    const searchParams = new URLSearchParams();
    if (params.date) searchParams.set('date', params.date);
    if (params.month) searchParams.set('month', params.month);

    const queryString = searchParams.toString();
    const url = `${API_BASE}/providers/${providerId}/slots${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url);
    return handleResponse(response);
}

export async function getSpecialties() {
    const response = await fetch(`${API_BASE}/providers/specialties`);
    return handleResponse(response);
}

// Appointment type endpoints
export async function getAppointmentTypes() {
    const response = await fetch(`${API_BASE}/appointment-types`);
    return handleResponse(response);
}

// Appointment endpoints
export async function bookAppointment(data) {
    const response = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(response);
}

export async function getAppointments(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.email) searchParams.set('email', params.email);
    if (params.confirmation_number) searchParams.set('confirmation_number', params.confirmation_number);

    const queryString = searchParams.toString();
    const response = await fetch(`${API_BASE}/appointments?${queryString}`);
    return handleResponse(response);
}

export async function getAppointment(id) {
    const response = await fetch(`${API_BASE}/appointments/${id}`);
    return handleResponse(response);
}

export async function cancelAppointment(id, reason = '') {
    const response = await fetch(`${API_BASE}/appointments/${id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancel_reason: reason })
    });
    return handleResponse(response);
}

export async function rescheduleAppointment(id, data) {
    const response = await fetch(`${API_BASE}/appointments/${id}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(response);
}

// AI endpoints
export async function getAISuggestions(description) {
    const response = await fetch(`${API_BASE}/ai/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
    });
    return handleResponse(response);
}
