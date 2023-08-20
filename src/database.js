import { Guild, GuildMember } from 'discord.js';
import { Model, Sequelize } from 'sequelize';

import { Pogbot } from './client.js';
import { Guild as GuildModel } from './models/guild.js';
import { Member as MemberModel } from './models/member.js';

export class PogDB {
    /** @type {PogDB} */
    static #instance;

    #client;

    #sequelize;

    member;
    guild;

    constructor(client) {
        PogDB.setInstance(this);

        this.#client = client;

        this.#sequelize = new Sequelize(process.env.DATABASE_URL);
        this.#sequelize
            .authenticate()
            .then(() => {
                this.#client.logger.debug('Database connection OK.');
            })
            .catch((err) => {
                this.#client.logger.error('Database connection error: ' + err);
                process.exit(-1);
            });

        this.#sequelize.sync({ force: true }).then(() => {
            this.#client.logger.debug('Database synced.');
        });

        this.#setupDefinitions();
    }

    #setupDefinitions() {
        const M = this.#sequelize.define('Member', MemberModel(), {
            timestamps: false,
        });
        const G = this.#sequelize.define('Guild', GuildModel(), {
            timestamps: false,
        });

        M.belongsTo(G);
        G.hasMany(M, {
            as: 'guild',
        });

        this.member = M;
        this.guild = G;
    }

    /**
     * Get an PogDB guild from an discord.js guild.
     * @param {Guild} g
     * @returns {Promise<Model<GuildModel>>}
     */
    async getGuild(g) {
        return await this.guild.findOrCreate({
            where: {
                guildId: g.id,
            },
        });
    }

    /**
     * Get an PogDB member from an discord.js guild member.
     * @param {GuildMember} member
     */
    async getMember(member) {
        return await this.member.findOrCreate({
            where: {
                userId: member.user.id,
                guildId: member.guild.id,
            },
        });
    }

    static getInstance() {
        return this.#instance;
    }

    static setInstance(inst) {
        this.#instance = inst;
    }
}
