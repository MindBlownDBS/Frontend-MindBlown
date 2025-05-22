import { BASE_URL } from '../config';

const ENDPOINTS = {
    LOGIN: '/login',
    REGISTER: '/register',
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



