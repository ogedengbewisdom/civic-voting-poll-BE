import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config();

const is_production = process.env.NODE_ENV === 'production';

export const data_source = new DataSource(
  is_production
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // entities: ['src/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*.ts'],
        synchronize: false,
        // ssl: {
        //   rejectUnauthorized: false,
        // },
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*.ts'],
        synchronize: false,
      },
);
