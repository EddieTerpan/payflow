import 'reflect-metadata';
import { DataSource } from 'typeorm';
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST ?? 'mysql-dev',
  port: Number(process.env.MYSQL_PORT ?? 3306),
  username: process.env.MYSQL_USER ?? 'root',
  password: process.env.MYSQL_PASSWORD ?? 'root',
  database: process.env.MYSQL_DB ?? 'payments',
  entities: [__dirname + '/src/**/*.orm-entity.{js,ts}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
});
