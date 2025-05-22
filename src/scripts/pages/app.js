import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { transitionHelper } from '../utils';

class App {
    #content = null;

    constructor({ content }) {
        this.#content = content;
    }

    async renderPage() {
        const url = getActiveRoute();
        const route = routes[url];

        // this.#content.innerHTML = await page.render();
        // await page.afterRender();

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
