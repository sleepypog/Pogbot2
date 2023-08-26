import { DataTypes } from 'sequelize';

export function Guild() {
    return {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true,
        },
        /*
         * Channels is stored as an single string, as it allows the usage of database
         * dialects that don't support arrays, for example, SQLite.
         */
        channels: {
            type: DataTypes.STRING,
            get() {
                const rawValue = this.getDataValue('channels');
                return rawValue ? rawValue.split(',') : [];
            },
            set(channels) {
                this.setDataValue('channels', channels.join(','));
            },
        },
    };
}
