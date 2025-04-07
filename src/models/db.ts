import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;

export const sequelize = new Sequelize(
    DB_NAME || '',
    DB_USER || '',
    DB_PASSWORD,
    {
        dialect: 'postgres',
        host: DB_HOST,
        port: Number(DB_PORT),
        logging: false,
    },
);

export const initDb = async () => {
    console.log('Initializing data base...\n');
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Data base initialized.\n');
};
