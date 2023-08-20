import { appendFileSync, readdirSync, writeFileSync } from 'node:fs';

const SOURCE_LANGUAGE = 'en';

const { default: sourceStrings } = await import(
    `../lang/${SOURCE_LANGUAGE}.json`,
    {
        assert: {
            type: 'json',
        },
    }
);

const languages = readdirSync('./lang').filter(
    (f) => f.endsWith('.json') && f !== `${SOURCE_LANGUAGE}.json`
);
languages.forEach(async (l) => {
    console.log(`Comparing ${l} to ${SOURCE_LANGUAGE}.json`);

    const { default: language } = await import(`../lang/${l}`, {
        assert: {
            type: 'json',
        },
    });

    const keys = [];
    Object.entries(language).forEach(([key]) => {
        keys.push(key);
    });

    const missing = {};
    Object.entries(sourceStrings).forEach(([key, string]) => {
        if (!keys.includes(key)) {
            console.log(`${l} is missing key ${key}, adding...`);
            missing[key] = string;
        }
    });

    const json = JSON.stringify({ ...language, ...missing }, null, 2);
    writeFileSync(`./lang/${l}`, json);
});
