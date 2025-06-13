import routes from '../routes/routes';
import { getActiveRoute, parseActivePathname } from '../routes/url-parser';
import { transitionHelper } from '../utils';

class App {
    #content = null;
    #sidebar = null;
    #sidebarToggle = null;
    #sidebarToggleIcon = null;
    #sidebarToggleContainer = null;
    #expanded = false;

    constructor({
        content,
        sidebar,
        sidebarToggle,
        sidebarToggleIcon,
        sidebarToggleContainer,
    }) {
        this.#content = content;
        this.#sidebar = sidebar;
        this.#sidebarToggle = sidebarToggle;
        this.#sidebarToggleIcon = sidebarToggleIcon;
        this.#sidebarToggleContainer = sidebarToggleContainer;
        this.setupSidebarToggle();
        this.setupNavigationLinks();
    }

    setupSidebarToggle() {
        if (!this.#sidebarToggle || !this.#sidebarToggleIcon || !this.#sidebar)
            return;

        this.#sidebarToggle.addEventListener('click', () => {
            console.log('clicked');
            this.#expanded = !this.#expanded;
            if (this.#expanded) {
                this.expandSidebar();
            } else {
                this.collapseSidebar();
            }
        });
    }

    setupNavigationLinks() {
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                if (this.#expanded) {
                    this.collapseSidebar();
                }
            });
        });

        const homeLogoLink = document.querySelector('a[href="#/"]');
        if (homeLogoLink) {
            homeLogoLink.addEventListener('click', () => {
                if (this.#expanded) {
                    this.collapseSidebar();
                }
            });
        }
        this.updateActiveNavLink();
    }

    collapseSidebar() {
        this.#expanded = false;
        this.#sidebar.classList.remove('w-56');
        this.#sidebar.classList.add('w-16');
        this.#sidebarToggleContainer.classList.remove('ml-54');
        this.#sidebarToggleIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M7.38 21.01c.49.49 1.28.49 1.77 0l8.31-8.31c.39-.39.39-1.02 0-1.41L9.15 2.98c-.49-.49-1.28-.49-1.77 0s-.49 1.28 0 1.77L14.62 12l-7.25 7.25c-.48.48-.48 1.28.01 1.76z"/></svg>`;
        document
            .querySelectorAll('.sidebar-label')
            .forEach((label) => label.classList.add('hidden'));
    }

    expandSidebar() {
        this.#expanded = true;
        this.#sidebar.classList.remove('w-16');
        this.#sidebar.classList.add('w-56');
        this.#sidebarToggleContainer.classList.add('ml-54');
        this.#sidebarToggleIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.62 2.99c-.49-.49-1.28-.49-1.77 0l-8.31 8.31c-.39.39-.39 1.02 0 1.41l8.31 8.31c.49.49 1.28.49 1.77 0s.49-1.28 0-1.77L9.38 12l7.25-7.25c.48-.48.48-1.28-.01-1.76z"/></svg>`;
        document
            .querySelectorAll('.sidebar-label')
            .forEach((label) => label.classList.remove('hidden'));
    }

    updateActiveNavLink() {
        const currentHash = window.location.hash || '#/';
        const navLinks = document.querySelectorAll('nav a');

        navLinks.forEach((link) => {
            const linkPath = link.getAttribute('href');
            const svg = link.querySelector('svg');

            if (linkPath === currentHash) {
                link.classList.add('text-[#00ADB5]');
                if (svg) {
                    svg.classList.add('text-[#00ADB5]');
                }
            } else {
                link.classList.remove('text-[#00ADB5]');
                if (svg) {
                    svg.classList.remove('text-[#00ADB5]');
                }
            }
        });
    }

    async renderPage() {
        const url = getActiveRoute();
        const { id } = parseActivePathname();
        let route = routes[url];

        if (!route) {
            route = routes['/404'];
        }

        const page = route(id);

        if (!page) {
            return;
        }

        const transition = transitionHelper({
            updateDOM: async () => {
                this.#content.innerHTML = await page.render();
                page.afterRender();
                this.updateActiveNavLink();
            },
        });

        transition.ready.catch(console.error);
        transition.updateCallbackDone.then(() => {
            scrollTo({ top: 0, behavior: 'instant' });
        });
    }
}

export default App;
