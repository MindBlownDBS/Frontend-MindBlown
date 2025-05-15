import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class App {
    #content = null;

    constructor({ content }) {
        this.#content = content;
    }

    async renderPage() {
        const url = getActiveRoute();
        const page = routes[url];

        this.#content.innerHTML = await page.render();
        await page.afterRender();
    }
}

export default App;
