import { DataTypes } from 'sequelize';

export function Member() {
    return {
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        score: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    };
}
