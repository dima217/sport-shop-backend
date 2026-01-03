/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

async function generateSwagger() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const swaggerConfig = configService.get('swagger');

  const swaggerOptions = new DocumentBuilder()
    .setTitle(swaggerConfig?.title || 'Sport Equipment API')
    .setDescription(swaggerConfig?.description || 'REST API for Sport Equipment E-commerce')
    .setVersion(swaggerConfig?.version || '1.0')
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
    .addServer(process.env.BASE_URL || 'http://84.201.188.209:3000', 'Production')
    .addServer('http://localhost:3000', 'Local')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);

  // Ensure output directory exists
  const outputDir = path.join(process.cwd(), 'swagger');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write JSON file
  const jsonPath = path.join(outputDir, 'swagger.json');
  fs.writeFileSync(jsonPath, JSON.stringify(document, null, 2));
  console.log(`✅ Swagger JSON generated: ${jsonPath}`);

  // Write YAML file (optional, requires js-yaml package)
  // const yamlPath = path.join(outputDir, 'swagger.yaml');
  // const yaml = require('js-yaml');
  // fs.writeFileSync(yamlPath, yaml.dump(document));
  // console.log(`✅ Swagger YAML generated: ${yamlPath}`);

  await app.close();
}

generateSwagger()
  .then(() => {
    console.log('🎉 Swagger documentation generated successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error generating Swagger documentation:', error);
    process.exit(1);
  });
