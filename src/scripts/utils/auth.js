import { getActiveRoute } from '../routes/url-parser';
import { ACCESS_TOKEN_KEY } from '../config';
import { loginModalTemplate } from '../pages/templates';

export function getAccessToken() {
    try {
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

        if (accessToken === 'null' || accessToken === 'undefined') {
            return null;
        }

        return accessToken;
    } catch (error) {
        console.error('getAccessToken: error:', error);
        return null;
    }
}

export function putAccessToken(token) {
    try {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
        return true;
    } catch (error) {
        console.error('putAccessToken: error:', error);
        return false;
    }
}

export function removeAccessToken() {
    try {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        return true;
    } catch (error) {
        console.error('getLogout: error:', error);
        return false;
    }
}

const unauthenticatedRoutesOnly = ['/login', '/register'];

export function checkUnauthenticatedRouteOnly(page) {
    const url = getActiveRoute();
    const isLogin = !!getAccessToken();

    if (unauthenticatedRoutesOnly.includes(url) && isLogin) {
        location.hash = '/';
        return null;
    }

    return page;
}

export function checkAuthenticatedRoute(page) {
    const isLogin = !!getAccessToken();

    if (!isLogin) {
        location.hash = '/login';
        return null;
    }

    return page;
}

export function checkProtectedRoute(page) {
    const isLogin = !!getAccessToken();

    if (!isLogin) {
        const currentUrl = window.location.hash;
        showLoginModal(currentUrl);
        return null;
    }

    return page;
}

function showLoginModal() {
    const modal = document.createElement('div');
    modal.className =
        'fixed inset-0 bg-black/70 flex items-center justify-center z-50';
    modal.innerHTML = loginModalTemplate();

    document.body.appendChild(modal);

    document.getElementById('cancel-login').addEventListener('click', () => {
        modal.remove();
        window.history.back();
    });

    document.getElementById('go-to-login').addEventListener('click', () => {
        modal.remove();
        window.location.hash = '/login';
    });
}

export function getLogout() {
    removeAccessToken();
}
