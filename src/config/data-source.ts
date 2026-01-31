import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';

// 加载环境变量
config({ path: resolve(__dirname, '../../.env') });

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: DB_HOST || 'localhost',
    port: parseInt(DB_PORT || '5432', 10),
    username: DB_USERNAME || 'cory',
    password: DB_PASSWORD || 'Qq898989',
    database: DB_DATABASE || 'nest_db',
    synchronize: false, // 生产环境禁用
    logging: true,
    entities: [resolve(__dirname, '../**/*.entity{.ts,.js}')],
    migrations: [resolve(__dirname, '../migrations/*{.ts,.js}')],
    subscribers: [],
});
