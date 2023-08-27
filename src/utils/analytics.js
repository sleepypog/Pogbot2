import prom from 'prom-client';

export class PogAnalytics {
    static instance;

    client;

    pogCounter;
    guildCounter;

    // TODO: Finish this.
    constructor() {
        PogAnalytics.setInstance(this);

        if (analyticsEnabled()) {
            this.client = prom;
            this.client.collectDefaultMetrics();

            this.pogCounter = new prom.Counter({
                name: 'pogbot_pogs',
                help: 'pogbot_pogs_help',
            });

            this.guildCounter = new prom.Gauge({
                name: 'pogbot_guilds',
                help: 'pogbot_guilds_help',
            });
        }
    }

    addPog() {
        if (analyticsEnabled()) {
            this.pogCounter.inc();
        }
    }

    addGuild() {
        if (analyticsEnabled()) {
            this.guildCounter.inc();
        }
    }

    removeGuild() {
        if (analyticsEnabled()) {
            this.guildCounter.dec();
        }
    }

    static setInstance(i) {
        PogAnalytics.instance = i;
    }

    static getInstance() {
        return PogAnalytics.instance;
    }
}

/**
 * Check if analytics are enabled.
 * @returns {boolean}
 */
export function analyticsEnabled() {
    return process.env.ANALYTICS_ENABLED;
}
