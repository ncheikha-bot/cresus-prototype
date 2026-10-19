import 'dotenv/config';
import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { creerApplication } from './application';
import { Configuration } from './config/configuration';

const demarrer = async () => {
  const app = await creerApplication();
  const config = app.get(Configuration);
  await app.listen(config.port, '0.0.0.0');

  const journal = new Logger('Crésus');
  journal.log(`API prête sur le port ${config.port} — documentation : /api/docs`);
  if (config.connexionDemo) journal.warn('Connexion de démonstration active (DEMO_LOGIN=true)');
};

void demarrer();
