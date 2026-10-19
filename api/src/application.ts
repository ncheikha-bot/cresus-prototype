import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Configuration } from './config/configuration';

/**
 * Construction de l'application, partagée par le démarrage et les tests :
 * les tests de bout en bout tournent ainsi sur la configuration réelle
 * (préfixe, validation, CORS), pas sur une copie qui finirait par diverger.
 */
export const creerApplication = async (): Promise<INestApplication> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Les tests n'ont que faire du journal de démarrage : seules les erreurs remontent.
    logger: process.env.NODE_ENV === 'test' ? ['error'] : ['error', 'warn', 'log'],
  });
  const config = app.get(Configuration);

  // Un dossier complet — associés, pièces, devis — dépasse la limite par défaut de 100 ko.
  app.useBodyParser('json', { limit: '5mb' });
  app.setGlobalPrefix('api');
  app.enableCors({ origin: config.originesAutorisees });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableShutdownHooks();

  const documentation = new DocumentBuilder()
    .setTitle('API Crésus')
    .setDescription("Persistance partagée des dossiers, authentification et temps réel.")
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, documentation));

  return app;
};
