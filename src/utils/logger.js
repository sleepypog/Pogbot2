import winston, { createLogger } from 'winston';
import { Pogbot } from '../client.js';

/*** @returns {import('winston').Logger} */
export function getLogger() {
    return createLogger({
        level: Pogbot.getInstance().getEnvironment() === 'DEVELOPMENT' ? 'silly' : 'info',
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
        transports: [new winston.transports.Console()],
    });
}
