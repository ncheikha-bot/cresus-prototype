import { Global, Module } from '@nestjs/common';
import { Configuration } from '../config/configuration';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [Configuration, PrismaService],
  exports: [Configuration, PrismaService],
})
export class PrismaModule {}
