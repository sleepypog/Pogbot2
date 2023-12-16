# Pogbot

> ⚠ Pogbot requires `yarn`.
> While [Gitmoji](https://gitmoji.dev/) is used for fun, you're not obliged to use it when contributing.

## Commands

-   `yarn lang:sync`
    Sync language files with `en.json`, adding missing keys.
    Language files have to contain valid JSON, if not, the tool will error.
-   `yarn build:info`
    Generate build information file with version, branch and commit data.
    Required for startup. This might be automated later on.
