// CSS imports
import '../styles/styles.css';
import '../styles/output.css';

import App from './pages/app';
import routes from './routes/routes';
import { getActiveRoute } from './routes/url-parser';
import { registerServiceWorker } from './utils';

function handleNavbarVisibility() {
    const hideNavbarRoutes = ['/login', '/register', '/404'];
    const hash = window.location.hash.replace('#', '') || '/';
    const navbar = document.getElementById('navbar-container');
    const mobileNavbar = document.getElementById('mobile-navbar');
    
    const activeRoute = getActiveRoute();
    const isValidRoute = routes[activeRoute] !== undefined;
    
    const shouldHideNavbar = hideNavbarRoutes.includes(hash) || !isValidRoute;

    if (shouldHideNavbar) {
        if (navbar) navbar.style.display = 'none';
        if (mobileNavbar) mobileNavbar.style.display = 'none';
    } else {
        if (navbar) navbar.style.display = '';
        if (mobileNavbar) mobileNavbar.style.display = ''; 
    }
}

function setupSmartNavigation() {
    const logoDesktop = document.querySelector('#sidebar a.block');
    const logoMobile = document.querySelector('#mobile-navbar a:first-child');
    
    const handleLogoClick = (e) => {
        if (localStorage.getItem('hasInteractedWithChatbot') === 'true') {
            e.preventDefault();
            window.location.href = "#/chatbot";
        }
    };
    
    if (logoDesktop) logoDesktop.addEventListener('click', handleLogoClick);
    if (logoMobile) logoMobile.addEventListener('click', handleLogoClick);
}

document.addEventListener('DOMContentLoaded', async () => {
    const app = new App({
        content: document.querySelector('#main-content'),
        sidebar: document.querySelector('#sidebar'),
        sidebarToggle: document.querySelector('#sidebar-toggle'),
        sidebarToggleIcon: document.querySelector('#sidebar-toggle-icon'),
        sidebarToggleContainer: document.querySelector('#sidebar-toggle-container'),
    });
    await app.renderPage();
    await registerServiceWorker();
    console.log('Berhasil mendaftarkan service worker.');
    handleNavbarVisibility();
    setupSmartNavigation();

    window.addEventListener('hashchange', async () => {
        await app.renderPage();
        handleNavbarVisibility();
    });
});
