/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../configuration.interface';

const logger = new Logger('DatabaseModule');

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig>) => {
        const postgres = config.get('postgres');
        const databaseUrl = process.env.DATABASE_URL;
        const isProduction = config.get('environment') === 'production';
        const synchronize = process.env.DB_SYNCHRONIZE
          ? process.env.DB_SYNCHRONIZE === 'true'
          : !isProduction;
        const useSsl = process.env.DB_SSL === 'true';

        if (!postgres) throw new Error('Postgres config missing!');

        logger.log(`Connecting to Postgres with: 
          host=${postgres.host}, 
          port=${postgres.port}, 
          username=${postgres.username}, 
          database=${postgres.database},
          source=${databaseUrl ? 'DATABASE_URL' : 'DB_* vars'}`);

        return {
          type: 'postgres',
          ...(databaseUrl
            ? {
                url: databaseUrl,
              }
            : {
                host: postgres.host,
                port: postgres.port,
                username: postgres.username,
                password: postgres.password,
                database: postgres.database,
              }),
          autoLoadEntities: true,
          synchronize,
          ssl: useSsl ? { rejectUnauthorized: false } : false,
          retryAttempts: 10,
          retryDelay: 3000,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
