import { Injectable, MessageEvent } from '@nestjs/common';
import { filter, interval, map, merge, Observable, Subject } from 'rxjs';
import type { Session } from '../auth/session';
import { peutVoir } from '../collections/acces';
import { DESCRIPTEURS, type Donnees, type NomCollection } from '../collections/descripteurs';

export type Evenement =
  | {
      type: 'upsert' | 'delete';
      collection: NomCollection;
      id: string;
      data?: Donnees;
      /** Pour filtrer à la diffusion ; jamais transmis au navigateur. */
      proprietaire: string | null;
      bankId?: string | null;
    }
  | { type: 'reset' };

/**
 * Diffusion des écritures aux autres postes.
 *
 * Chaque connexion reçoit les seules écritures qu'elle aurait le droit de lire :
 * le flux applique les mêmes règles que la lecture.
 */
@Injectable()
export class EvenementsService {
  private readonly flux$ = new Subject<Evenement>();

  publier(evenement: Evenement) {
    this.flux$.next(evenement);
  }

  pour(session: Session): Observable<MessageEvent> {
    const ecritures = this.flux$.pipe(
      filter(e => e.type === 'reset' || peutVoir(DESCRIPTEURS[e.collection], session, e)),
      map(e =>
        e.type === 'reset'
          ? { data: { type: 'reset' } }
          : { data: { type: e.type, collection: e.collection, id: e.id, data: e.data } },
      ),
    );
    // Les hébergeurs coupent les connexions muettes : un battement régulier
    // garde le flux ouvert. Le navigateur ignore ce type d'événement.
    const battements = interval(25_000).pipe(map(() => ({ type: 'ping', data: '' })));
    return merge(ecritures, battements);
  }
}
