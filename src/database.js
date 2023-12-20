import { Guild, GuildMember } from 'discord.js';
import { Model, Op, Sequelize } from 'sequelize';

import { Guild as GuildModel } from './models/guild.js';
import { Member as MemberModel } from './models/member.js';

// TODO: Setup Sequelize transactions for database safety.
// TODO: Caching.

export class PogDB {
    /** @type {PogDB} */
    static #instance;

    #client;

    #sequelize;

    /** @type {Model} */
    member;

    /** @type {Model} */
    guild;

    constructor(client) {
        PogDB.setInstance(this);

        this.#client = client;

        this.#sequelize = new Sequelize(process.env.DATABASE_URL, {
            logging: false,
        });
        this.#sequelize
            .authenticate()
            .then(() => {
                this.#client.logger.debug('Database connection OK.');
            })
            .catch((err) => {
                this.#client.logger.error('Database connection error: ' + err);
                process.exit(-1);
            });

        this.#sequelize.sync().then(() => {
            this.#client.logger.debug('Database synced.');
        });

        this.#setupDefinitions();
    }

    // TODO: Setup associations.
    #setupDefinitions() {
        const M = this.#sequelize.define('Member', MemberModel(), {
            timestamps: false,
        });

        const G = this.#sequelize.define('Guild', GuildModel(), {
            timestamps: false,
        });

        this.member = M;
        this.guild = G;
    }

    /**
     * Get an PogDB guild from an discord.js guild.
     * @param {Guild} guild Guild object
     * @returns {Promise<Model<GuildModel>>}
     */
    async getGuild(guild) {
        return (
            await this.guild.findOrCreate({
                where: {
                    id: guild.id,
                },
            })
        )[0];
    }

    /**
     * Get an PogDB member from an discord.js guild member.
     * @param {GuildMember} member Member object
     * @returns {Promise<Model<MemberModel>>}
     */
    async getMember(member) {
        return (
            await this.member.findOrCreate({
                where: {
                    userId: member.id,
                    guildId: member.guild.id,
                },
            })
        )[0];
    }

    /**
     * Get an array with scores for an guild, sorted from highest to lowest.
     * @param {Guild} guild Guild object
     * @returns {Promise<Model<MemberModel>[]>}
     */
    async getTopScores(guild) {
        return await this.member.findAll({
            limit: 10,
            order: [['score', 'DESC']],
            where: {
                guildId: guild.id,
                score: { [Op.gte]: 1 }, // Members with 0 pogs won't appear in the leaderboard
            },
        });
    }

    /**
     * Get the amount of scores for an guild.
     * @param {Guild} guild Guild object
     * @returns {Promise<number>}
     */
    async getScoreCount(guild) {
        return await this.member.count({
            where: {
                guildId: guild.id,
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
