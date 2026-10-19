import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { urlPourMigrations } from './src/config/base-de-donnees';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: urlPourMigrations(),
  },
});
