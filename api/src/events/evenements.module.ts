import { Module } from '@nestjs/common';
import { EvenementsController } from './evenements.controller';
import { EvenementsService } from './evenements.service';

@Module({
  controllers: [EvenementsController],
  providers: [EvenementsService],
  exports: [EvenementsService],
})
export class EvenementsModule {}
