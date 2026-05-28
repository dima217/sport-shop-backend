/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DatabaseExceptionFilter } from './exceptions/database-exception.filter';
import type { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  /* app.connectMicroservice<RmqOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://rabbitmq:5672`],
      queue: 'create_charge_psp',
      prefetchCount: 1,
      persistent: true,
      noAck: false,
      queueOptions: {
        durable: true,
      },
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
    },
  });

  await app.startAllMicroservices(); */
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new DatabaseExceptionFilter());

  const configService = app.get(ConfigService);
  const swaggerConfig = configService.get('swagger');

  if (swaggerConfig?.enable) {
    const publicBaseUrl =
      process.env.BASE_URL ||
      (process.env.RAILWAY_PUBLIC_DOMAIN
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : 'http://localhost:3000');

    const swaggerOptions = new DocumentBuilder()
      .setTitle(swaggerConfig.title || 'Sport Equipment API')
      .setDescription(swaggerConfig.description || 'REST API for Sport Equipment E-commerce')
      .setVersion(swaggerConfig.version || '1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'bearerAuth',
      )
      .addServer(publicBaseUrl, 'Public')
      .addServer('http://localhost:3000', 'Local')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerOptions);
    SwaggerModule.setup(swaggerConfig.path || 'api-docs', app, document);

    // Export Swagger JSON endpoint
    app.getHttpAdapter().get('/api-docs-json', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(document, null, 2));
    });
  }
  app.enableCors();
  const port = configService.get<number>('port') || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
