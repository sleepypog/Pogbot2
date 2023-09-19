import { DataTypes } from 'sequelize';

export function Guild() {
    return {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true,
        },
        /**
         * Triggers are stored as an single string, as it allows the usage of database
         * dialects that don't support arrays, for example, SQLite.
         */
        triggers: {
            type: DataTypes.STRING,
            get() {
                const rawValue = this.getDataValue('triggers');
                return rawValue ? rawValue.split(';') : [];
            },
            set(t) {
                this.setDataValue('triggers', t.join(';'));
            },
        },
    };
}
