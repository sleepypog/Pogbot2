import i18next from 'i18next';

import { DISCORD_LOCALE_CODES } from '../translation.js';

// TODO: JSDocs
export function getDescription(key) {
    return i18next.t(key, { ns: 'descriptions' });
}

/**
 * Get all translations of an key. Used for descriptions.
 * @param {*} key Key to translate
 */
export function getDescriptionLocalizations(key) {
    const localization = {};
    DISCORD_LOCALE_CODES.forEach((locale) => {
        localization[locale] = i18next.t(key, {
            ns: 'descriptions',
            lng: locale,
        });
    });
    return localization;
}
