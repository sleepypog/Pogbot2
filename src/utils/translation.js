import { Collection } from 'discord.js';
import { readdirSync } from 'node:fs';
import prettyMilliseconds from 'pretty-ms';
import { sprintf } from 'sprintf-js';

import { Pogbot } from '../client.js';

export const DEFAULT_LOCALE = 'en';

export class Translation {
    /** @type {Translation} */
    static instance;

    #strings;

    constructor() {
        Translation.setInstance(this);

        this.#strings = new Collection();
        this.#loadStrings();
    }

    /*
     * This is practically an copypaste of the command loading code.
     */
    #loadStrings() {
        const strings = readdirSync('./lang').filter((f) =>
            f.endsWith('.json')
        );
        strings.forEach(async (l, i) => {
            const { default: language } = await import(`../../lang/${l}`, {
                assert: {
                    type: 'json',
                },
            });

            this.#strings.set(l.replace('.json', ''), language);

            Pogbot.getInstance().logger.silly(
                `Registered language "${l}". [entry ${i + 1} out of ${
                    strings.length
                }]`
            );
        });
    }

    /**
     * @param {String} locale
     * @param {String} key
     * @param {...object} args
     */
    static t(loc, key, ...args) {
        let locale = loc.split('-')[0];

        const strings = Translation.getInstance().#strings.get(locale);

        try {
            if (strings[key] === undefined) {
                Pogbot.getInstance().logger.silly(
                    `String '${key}' not found in locale ${locale}, defaulting to ${DEFAULT_LOCALE}`
                );

                locale = DEFAULT_LOCALE;

                return sprintf(
                    Translation.getInstance().#strings.get(DEFAULT_LOCALE)[key],
                    args
                );
            } else {
                return sprintf(strings[key], args);
            }
        } catch (error) {
            Pogbot.getInstance().logger.warn(
                `Error while formatting string '${key}' in ${locale}: ${error.message}`
            );
            return key;
        }
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
