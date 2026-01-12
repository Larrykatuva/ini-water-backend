import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import SwaggerConfig from './configs/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validates pay load sent to nest endpoints
  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
      forbidUnknownValues: false,
    }),
  );

  // Enable cors
  app.enableCors();

  // Enable URI versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Swagger documentation configuration
  const external = SwaggerModule.createDocument(app, SwaggerConfig, {
    ignoreGlobalPrefix: true,
  });
  SwaggerModule.setup('swagger-ui', app, external, {
    jsonDocumentUrl: 'swagger/json',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
