import { config } from 'dotenv';

import { Pogbot } from './client.js';

config();
new Pogbot(process.env.TOKEN).setEnvironment(process.env.NODE_ENV === 'development' ? 'DEVELOPMENT' : 'PRODUCTION');
