import { Collection } from 'discord.js'
import { readdirSync } from 'node:fs'
import prettyMilliseconds from 'pretty-ms'
import { sprintf } from 'sprintf-js'

import { Pogbot } from './client.js'

export const DEFAULT_LOCALE = 'en'

export class Translation {
    /** @type {Translation} */
    static instance

    #strings

    constructor() {
        Translation.setInstance(this)

        this.#strings = new Collection()
        this.#loadStrings()
    }

    /*
     * This is practically an copypaste of the command loading code.
     */
    #loadStrings() {
        const strings = readdirSync('./locales').filter((f) =>
            f.endsWith('.json')
        )
        strings.forEach(async (l, i) => {
            const { default: language } = await import(`../locales/${l}`, {
                assert: {
                    type: 'json',
                },
            })

            this.#strings.set(l.replace(".json", ""), language)

            Pogbot.getInstance().logger.silly(
                `Registered language "${l}". [entry ${i + 1} out of ${
                    strings.length
                }]`
            )
        })
    }

    // FIXME: Still working this out.
    static t(locale, key, ...args) {
        const loc = Translation.getInstance().#strings.get(locale)
        return loc[key] !== undefined
            ? sprintf(loc[key], args)
            : sprintf(
                  Translation.getInstance().#strings.get(DEFAULT_LOCALE)[key],
                  args
              )
    }

    /**
     * Get an human-readable duration.
     * @param {number} ms Amount of milliseconds
     */
    static d(ms) {
        return prettyMilliseconds(ms) ?? ''
    }

    static getInstance() {
        return this.instance
    }

    /** @param {Translation} i */
    static setInstance(i) {
        this.instance = i
    }
}
