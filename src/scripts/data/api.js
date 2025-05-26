import { BASE_URL } from '../config';

const ENDPOINTS = {
    LOGIN: '/login',
    REGISTER: '/register',
    MIND_TRACKER: '/mindTracker',
    MIND_TRACKER_CHECK: '/mindTracker/check',
} 

export async function getRegister(username, name, email, password) {
    const data = JSON.stringify({ username, name, email, password });
    const response = await fetch(`${BASE_URL}${ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: data,
    });

    const responseJson = await response.json();

    return responseJson;
}

export async function getLogin(usernameOrEmail, password) {
    const data = JSON.stringify({ usernameOrEmail, password });
    const response = await fetch(`${BASE_URL}${ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: data,
    });

    const responseJson = await response.json();

    return responseJson;
}

export async function checkTodayEntry() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('Anda belum login. Silakan login terlebih dahulu.');
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const response = await fetch(`${BASE_URL}${ENDPOINTS.MIND_TRACKER_CHECK}/${todayStr}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const result = await response.json();
    
    if (response.error) {
        throw new Error(result.message || 'Terjadi kesalahan saat mengecek data');
    }

    return result;
}

export async function getEntryByDate(dateStr) {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('Anda belum login. Silakan login terlebih dahulu.');
    }

    const dateObj = new Date(dateStr);
    const apiDateStr = dateObj.toISOString().split('T')[0];

    const response = await fetch(`${BASE_URL}${ENDPOINTS.MIND_TRACKER}/${apiDateStr}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    return await response.json();
}

export async function saveEntry(data) {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('Anda belum login. Silakan login terlebih dahulu.');
    }

    const response = await fetch(`${BASE_URL}${ENDPOINTS.MIND_TRACKER}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (response.error) {
        throw new Error(result.message || 'Terjadi kesalahan saat menyimpan data');
    }

    return result;
}
