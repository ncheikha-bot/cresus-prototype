import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Publique } from '../auth/session';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Santé')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Publique()
  @Get()
  @ApiOperation({ summary: "État de l'API et de sa base" })
  async etat() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({ statut: 'degrade', base: 'injoignable' });
    }
    return { statut: 'ok', base: 'ok' };
  }
}
