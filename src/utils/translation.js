import i18next from 'i18next';
import ICU from 'i18next-icu';
import resourcesToBackend from 'i18next-resources-to-backend';
import prettyMilliseconds from 'pretty-ms';

import { Pogbot } from '../client.js';

export const DEFAULT_LOCALE = 'en';

export class Translation {
    /** @type {Translation} */
    static instance;

    constructor() {
        Translation.setInstance(this);

        i18next
            .use(
                resourcesToBackend((language, namespace) =>
                    import(`../../lang/${language}/${namespace}.json`, {
                        assert: {
                            type: 'json',
                        },
                    })
                )
            )
            .use(ICU)
            .init({
                ns: ['strings'],
                defaultNs: 'strings',
                supportedLngs: ['en'],
                fallbackLng: 'en',
                debug: true,
            })
            .then((_) => {
                Pogbot.getInstance().logger.debug(
                    'Testing ICU string support.'
                );
                Pogbot.getInstance().logger.silly(
                    i18next.t('score', { amount: 0 })
                );
                Pogbot.getInstance().logger.silly(
                    i18next.t('score', { amount: 1 })
                );
                Pogbot.getInstance().logger.silly(
                    i18next.t('score', { amount: 2 })
                );
            });
    }

    /**
     * Get an human-readable duration.
     * @param {number} ms Amount of milliseconds
     */
    static d(ms) {
        return prettyMilliseconds(ms) ?? '';
    }

    static getInstance() {
        return this.instance;
    }

    /** @param {Translation} i */
    static setInstance(i) {
        this.instance = i;
    }
}
