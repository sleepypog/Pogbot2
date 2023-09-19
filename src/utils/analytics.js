import { createServer } from 'node:http';
import prom from 'prom-client';

import { Pogbot } from '../client.js';

const ANALYTICS_PORT = 7171;

export class PogAnalytics {
    static instance;

    analyticsServer;

    client;

    pogCounter;
    guildCounter;
    apiLatencyHistory;

    // TODO: Finish this.
    constructor() {
        PogAnalytics.setInstance(this);

        if (analyticsEnabled()) {
            this.client = prom;
            this.client.collectDefaultMetrics();

            this.pogCounter = new prom.Counter({
                name: 'pogbot_pogs',
                help: 'Number of pogs processed by the current bot instance.',
            });

            this.guildCounter = new prom.Gauge({
                name: 'pogbot_guilds',
                help: 'Number of guilds where Pogbot is being used.',
            });

            this.apiLatencyHistory = new prom.Histogram({
                name: 'discord_api_latency',
                help: 'Discord API Latency',
            });

            this.analyticsServer = createServer(async (_, res) => {
                res.writeHead(200, {
                    'Content-Type': this.client.register.contentType,
                });
                res.write(await this.client.register.metrics());
            });

            this.analyticsServer.listen(ANALYTICS_PORT, () => {
                Pogbot.getInstance().logger.info(
                    `Analytics enabled. Server listening on port ${ANALYTICS_PORT}.`
                );
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

    setGuilds(amount) {
        if (analyticsEnabled()) {
            this.guildCounter.set(amount);
        }
    }

    reportAPIPing(ping) {
        if (analyticsEnabled()) {
            this.apiLatencyHistory.observe(Math.round(ping));
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
    return process.env.ANALYTICS_ENABLED ?? false;
}
