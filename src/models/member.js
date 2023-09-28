import { DataTypes } from 'sequelize';

export function Member() {
    return {
        uuid: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        score: {
            type: DataTypes.SMALLINT,
            defaultValue: 0,
        },
    };
}
