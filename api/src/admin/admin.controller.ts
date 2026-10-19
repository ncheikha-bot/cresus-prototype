import { Controller, ForbiddenException, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Session, SessionCourante } from '../auth/session';
import { CollectionsService } from '../collections/collections.service';

@ApiTags('Administration')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly collections: CollectionsService) {}

  @Post('reinitialiser')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Efface toutes les données métier',
    description:
      "Remet la démonstration à zéro pour tout le monde : sociétés, dossiers, notifications… Les comptes sont conservés. Les navigateurs ouverts vident leur cache à la réception de l'événement.",
  })
  async reinitialiser(@SessionCourante() session: Session) {
    if (session.role !== 'admin') throw new ForbiddenException("Réservé à l'administration");
    await this.collections.reinitialiser();
  }
}
