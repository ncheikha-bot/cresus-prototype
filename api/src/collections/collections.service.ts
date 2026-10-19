import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Session } from '../auth/session';
import { EvenementsService } from '../events/evenements.service';
import { PrismaService } from '../prisma/prisma.service';
import { filtreLecture, peutEcrire, peutSupprimer, type LigneExistante } from './acces';
import {
  DESCRIPTEURS,
  NOMS_COLLECTIONS,
  type Descripteur,
  type Donnees,
  type NomCollection,
} from './descripteurs';

/** Enregistrement tel que l'API le rend : l'identifiant et l'objet complet. */
export interface Enregistrement {
  id: string;
  data: Donnees;
}

/** Ligne brute d'une table de collection, quel que soit le modèle. */
type Ligne = Record<string, unknown> & { data: unknown };

/** Sous-ensemble des délégués Prisma dont le service a besoin. */
interface Delegue {
  findMany(args: { where: object; orderBy?: object }): Promise<Ligne[]>;
  findUnique(args: { where: object }): Promise<Ligne | null>;
  upsert(args: { where: object; create: object; update: object }): Promise<Ligne>;
  delete(args: { where: object }): Promise<Ligne>;
}

const ID_VALIDE = /^[\w.:@-]{1,200}$/;

@Injectable()
export class CollectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evenements: EvenementsService,
  ) {}

  /** Tout ce que la session peut lire, famille par famille : l'hydratation du frontend. */
  async toutLire(session: Session): Promise<Record<NomCollection, Enregistrement[]>> {
    const paires = await Promise.all(
      NOMS_COLLECTIONS.map(async nom => [nom, await this.lister(nom, session)] as const),
    );
    return Object.fromEntries(paires) as Record<NomCollection, Enregistrement[]>;
  }

  async lister(nom: NomCollection, session: Session): Promise<Enregistrement[]> {
    const d = DESCRIPTEURS[nom];
    const filtre = filtreLecture(d, session);
    if (filtre === null) return [];
    const lignes = await this.delegue(d).findMany({ where: filtre, orderBy: { updatedAt: 'desc' } });
    return lignes.map(ligne => this.versEnregistrement(d, ligne));
  }

  async enregistrer(nom: NomCollection, id: string, donnees: Donnees, session: Session) {
    this.verifierId(id);
    const d = DESCRIPTEURS[nom];

    // L'identifiant de l'adresse fait foi : le corps ne peut pas en désigner un autre.
    const data: Donnees = d.cle === 'id' ? { ...donnees, id } : donnees;
    const colonnes = await d.colonnes(data, sid => this.proprietaireDeSociete(sid), id);

    const existante = await this.delegue(d).findUnique({ where: { [d.cle]: id } });

    // L'avancement d'un dossier peut arriver avant la société elle-même : le
    // client les écrit coup sur coup. Il en devient alors provisoirement le
    // propriétaire, et la société, à son arrivée, rétablit le sien.
    if (d.nom === 'company-processes' && colonnes.ownerId === null && session.role === 'client') {
      colonnes.ownerId = session.id;
    }

    const nouvelle = {
      proprietaire: (colonnes[d.champProprietaire] as string | null) ?? null,
      bankId: (colonnes.bankId as string | null | undefined) ?? null,
    };
    if (!peutEcrire(d, session, nouvelle, existante ? this.resumer(d, existante) : null)) {
      throw new ForbiddenException(`Écriture refusée sur ${nom}/${id}`);
    }

    await this.delegue(d).upsert({
      where: { [d.cle]: id },
      create: { [d.cle]: id, ...colonnes, data },
      update: { ...colonnes, data },
    });

    // Le propriétaire d'un dossier suit celui de la société.
    if (d.nom === 'companies') {
      await this.prisma.companyProcess.updateMany({
        where: { companyId: id },
        data: { ownerId: colonnes.ownerId as string | null },
      });
    }

    this.evenements.publier({ type: 'upsert', collection: nom, id, data, ...nouvelle });
    return { id, data };
  }

  async supprimer(nom: NomCollection, id: string, session: Session): Promise<void> {
    this.verifierId(id);
    const d = DESCRIPTEURS[nom];
    const existante = await this.delegue(d).findUnique({ where: { [d.cle]: id } });
    // Supprimer ce qui n'existe plus n'est pas une erreur : deux postes
    // peuvent effacer la même ligne à quelques secondes d'écart.
    if (!existante) return;

    const resume = this.resumer(d, existante);
    if (!peutSupprimer(d, session, resume)) {
      throw new ForbiddenException(`Suppression refusée sur ${nom}/${id}`);
    }

    await this.delegue(d).delete({ where: { [d.cle]: id } });
    if (d.nom === 'companies') {
      await this.prisma.companyProcess.deleteMany({ where: { companyId: id } });
    }
    this.evenements.publier({ type: 'delete', collection: nom, id, ...resume });
  }

  /** Efface toutes les données métier — les comptes restent. */
  async reinitialiser(): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.companyProcess.deleteMany(),
      this.prisma.company.deleteMany(),
      this.prisma.draft.deleteMany(),
      this.prisma.notification.deleteMany(),
      this.prisma.appointment.deleteMany(),
      this.prisma.bankRequest.deleteMany(),
      this.prisma.modification.deleteMany(),
      this.prisma.domiciliation.deleteMany(),
      this.prisma.brandingOrder.deleteMany(),
    ]);
    this.evenements.publier({ type: 'reset' });
  }

  private async proprietaireDeSociete(societeId: unknown): Promise<string | null> {
    if (typeof societeId !== 'string' || !societeId) return null;
    const societe = await this.prisma.company.findUnique({
      where: { id: societeId },
      select: { ownerId: true },
    });
    return societe?.ownerId ?? null;
  }

  private versEnregistrement(d: Descripteur, ligne: Ligne): Enregistrement {
    return { id: String(ligne[d.cle]), data: (ligne.data ?? {}) as Donnees };
  }

  private resumer(d: Descripteur, ligne: Ligne): LigneExistante {
    return {
      proprietaire: (ligne[d.champProprietaire] as string | null) ?? null,
      bankId: (ligne.bankId as string | null | undefined) ?? null,
    };
  }

  private delegue(d: Descripteur): Delegue {
    return this.prisma[d.modele] as unknown as Delegue;
  }

  private verifierId(id: string) {
    if (!ID_VALIDE.test(id)) throw new BadRequestException(`Identifiant invalide : ${id}`);
  }
}

/** Contrôle du nom de collection reçu dans l'adresse. */
export const exigerCollection = (nom: string): NomCollection => {
  if (!(NOMS_COLLECTIONS as readonly string[]).includes(nom)) {
    throw new NotFoundException(`Collection inconnue : ${nom}`);
  }
  return nom as NomCollection;
};
