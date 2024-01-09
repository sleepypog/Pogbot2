import { EmbedBuilder, codeBlock } from 'discord.js';
import i18next from 'i18next';

import { Pogbot } from '../client.js';

/**
 * Wrap an JSON object around an code block.
 * @param {object} object Object to format
 * @returns {string}
 */
export function formatJSON(object) {
    return codeBlock('json', JSON.stringify(object, null, 2));
}

/**
 * Clean an stacktrace for debugging purposes.
 * @param {string} stack Stacktrace to clean
 */
export function cleanStacktrace(stack) {
    let stacktrace = stack.split('\n');
    delete stacktrace[0]; // Remove Error#toString
    stacktrace.splice(5); // Remove any element after the first four elements
    stacktrace = stacktrace.map((e) => e.trim()); // Trim all elements.
    console.log(stacktrace);
    return stacktrace.join('\n');
}

/**
 * Generate an error embed from an Error object.
 * @param {string} locale Pogbot language code
 * @param {Error} error Error object
 * @returns translated error embed.
 */
export function generateErrorEmbed(locale, error) {
    return new EmbedBuilder()
        .setTitle(i18next.t('error.title', { lng: locale }))
        .setDescription(
            i18next.t('error.execution', {
                lng: locale,
                name: error.name,
                description: error.message,
                environment: Pogbot.getInstance()
                    .getEnvironment()
                    .toString()
                    .toLowerCase(),
                stack: cleanStacktrace(error.stack),
            })
        )
        .setTimestamp(Date.now());
}
