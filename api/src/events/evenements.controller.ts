import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { JetonEnParametre, Session, SessionCourante } from '../auth/session';
import { EvenementsService } from './evenements.service';

@ApiTags('Temps réel')
@Controller()
export class EvenementsController {
  constructor(private readonly evenements: EvenementsService) {}

  @JetonEnParametre()
  @Sse('events')
  @ApiOperation({
    summary: 'Flux des écritures (Server-Sent Events)',
    description:
      'Chaque message porte { type, collection, id, data }. type vaut upsert, delete ou reset.',
  })
  @ApiQuery({ name: 'token', description: 'Jeton de session (EventSource ne pose pas d’en-tête)' })
  flux(@SessionCourante() session: Session): Observable<MessageEvent> {
    return this.evenements.pour(session);
  }
}
