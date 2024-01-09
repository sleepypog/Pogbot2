import { Locale } from 'discord.js';
import i18next from 'i18next';
import I18NexFsBackend from 'i18next-fs-backend';
import ICU from 'i18next-icu';
import prettyMilliseconds from 'pretty-ms';

import { Pogbot } from './client.js';

export const DEFAULT_LOCALE = 'en';
export const VALID_LOCALE_CODES = ['en', 'es'];
export const DISCORD_LOCALE_CODES = getDiscordLocaleCodes();

export class Translation {
    /** @type {Translation} */
    static instance;

    constructor() {
        Translation.setInstance(this);

        console.log(DISCORD_LOCALE_CODES);

        i18next
            .use(I18NexFsBackend)
            .use(ICU)
            .init({
                ns: ['strings', 'descriptions'],
                defaultNs: 'strings',

                supportedLngs: VALID_LOCALE_CODES,
                preload: VALID_LOCALE_CODES,
                nonExplicitSupportedLngs: true,
                fallbackLng: DEFAULT_LOCALE,

                backend: {
                    loadPath: './lang/{{lng}}/{{ns}}.json',
                },
            })
            .then((_) => {
                /**
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
                */
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

// TODO: Wait for Discord.js to add es-419 to their Locale enum.
function getDiscordLocaleCodes() {
    const values = Object.values(Locale);
    return values;
}
