import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { transitionHelper } from '../utils';

class App {
    #content = null;
    #sidebar = null;
    #sidebarToggle = null;
    #sidebarToggleIcon = null;
    #sidebarToggleContainer = null;

    constructor({ content, sidebar, sidebarToggle, sidebarToggleIcon, sidebarToggleContainer }) {
        this.#content = content;
        this.#sidebar = sidebar;
        this.#sidebarToggle = sidebarToggle;
        this.#sidebarToggleIcon = sidebarToggleIcon;
        this.#sidebarToggleContainer = sidebarToggleContainer;
        this.setupSidebarToggle();
    }

    setupSidebarToggle() {
        if (!this.#sidebarToggle || !this.#sidebarToggleIcon || !this.#sidebar) return;
        let expanded = false;
        this.#sidebarToggle.addEventListener('click', () => {
            console.log('clicked');
            expanded = !expanded;
            if (expanded) {
                this.#sidebar.classList.remove('w-16');
                this.#sidebar.classList.add('w-56');
                this.#sidebarToggleContainer.classList.add('ml-54');
                this.#sidebarToggleIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.62 2.99c-.49-.49-1.28-.49-1.77 0l-8.31 8.31c-.39.39-.39 1.02 0 1.41l8.31 8.31c.49.49 1.28.49 1.77 0s.49-1.28 0-1.77L9.38 12l7.25-7.25c.48-.48.48-1.28-.01-1.76z"/></svg>`;
                document.querySelectorAll('.sidebar-label').forEach(label => label.classList.remove('hidden'));
            } else {
                this.#sidebar.classList.remove('w-56');
                this.#sidebar.classList.add('w-16');
                this.#sidebarToggleContainer.classList.remove('ml-54');
                this.#sidebarToggleIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M7.38 21.01c.49.49 1.28.49 1.77 0l8.31-8.31c.39-.39.39-1.02 0-1.41L9.15 2.98c-.49-.49-1.28-.49-1.77 0s-.49 1.28 0 1.77L14.62 12l-7.25 7.25c-.48.48-.48 1.28.01 1.76z"/></svg>`;
                document.querySelectorAll('.sidebar-label').forEach(label => label.classList.add('hidden'));
            }
        });
    }

    async renderPage() {
        const url = getActiveRoute();
        const route = routes[url];

        const page = route();

        const transition = transitionHelper({
            updateDOM: async () => {
                this.#content.innerHTML = await page.render();
                page.afterRender();
            },
        });

        transition.ready.catch(console.error);
        transition.updateCallbackDone.then(() => {
        scrollTo({ top: 0, behavior: 'instant' });
        });
    }
}

export default App;
