import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  PipeTransform,
  Injectable,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsObject } from 'class-validator';
import { Session, SessionCourante } from '../auth/session';
import { CollectionsService, exigerCollection } from './collections.service';
import { NOMS_COLLECTIONS, type NomCollection } from './descripteurs';

@Injectable()
class NomCollectionPipe implements PipeTransform<string, NomCollection> {
  transform(valeur: string): NomCollection {
    return exigerCollection(valeur);
  }
}

export class EnregistrementDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: "L'objet complet, tel que l'application le manipule",
  })
  @IsObject()
  data: Record<string, unknown>;
}

const PARAM_COLLECTION = { name: 'collection', enum: NOMS_COLLECTIONS };

@ApiTags('Collections')
@ApiBearerAuth()
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collections: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'Tout ce que la session peut lire, par famille' })
  toutLire(@SessionCourante() session: Session) {
    return this.collections.toutLire(session);
  }

  @Get(':collection')
  @ApiParam(PARAM_COLLECTION)
  @ApiOperation({ summary: "Les lignes visibles d'une famille" })
  lister(@Param('collection', NomCollectionPipe) nom: NomCollection, @SessionCourante() session: Session) {
    return this.collections.lister(nom, session);
  }

  @Put(':collection/:id')
  @ApiParam(PARAM_COLLECTION)
  @ApiOperation({ summary: 'Crée ou remplace une ligne' })
  enregistrer(
    @Param('collection', NomCollectionPipe) nom: NomCollection,
    @Param('id') id: string,
    @Body() corps: EnregistrementDto,
    @SessionCourante() session: Session,
  ) {
    return this.collections.enregistrer(nom, id, corps.data, session);
  }

  @Delete(':collection/:id')
  @HttpCode(204)
  @ApiParam(PARAM_COLLECTION)
  @ApiOperation({ summary: 'Supprime une ligne (sans erreur si elle a déjà disparu)' })
  async supprimer(
    @Param('collection', NomCollectionPipe) nom: NomCollection,
    @Param('id') id: string,
    @SessionCourante() session: Session,
  ) {
    await this.collections.supprimer(nom, id, session);
  }
}
