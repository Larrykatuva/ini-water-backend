import { DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Infinity Water Backend Service')
  .setDescription('This service is made to handle infinity sms backend service')
  .setVersion('1.0')
  .addTag('Infinity Service')
  .build();

export default config;
