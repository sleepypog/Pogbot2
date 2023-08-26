import winston, { createLogger } from 'winston';

/*** @returns {import('winston').Logger} */
export function getLogger() {
    return createLogger({
        level: process.env.DEBUG ? 'silly' : 'info',
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
        transports: [new winston.transports.Console()],
    });
}
