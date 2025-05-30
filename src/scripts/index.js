// CSS imports
import '../styles/styles.css';
import '../styles/output.css';

import App from './pages/app';

function handleNavbarVisibility() {
    const hideNavbarRoutes = ['/login', '/register'];
    const hash = window.location.hash.replace('#', '') || '/';
    const navbar = document.getElementById('navbar-container');
 

    if (hideNavbarRoutes.includes(hash)) {
        if (navbar) navbar.style.display = 'none';
    } else {
        if (navbar) navbar.style.display = '';
    }
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
    handleNavbarVisibility();

    window.addEventListener('hashchange', async () => {
        await app.renderPage();
        handleNavbarVisibility();
    });
});
