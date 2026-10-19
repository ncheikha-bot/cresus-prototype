import { Module } from '@nestjs/common';
import { AdminController } from './admin/admin.controller';
import { AuthModule } from './auth/auth.module';
import { CollectionsModule } from './collections/collections.module';
import { EvenementsModule } from './events/evenements.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, EvenementsModule, CollectionsModule],
  controllers: [AdminController, HealthController],
})
export class AppModule {}
