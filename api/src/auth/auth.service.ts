import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { Configuration } from '../config/configuration';
import type { User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { Role, Session } from './session';

/** Utilisateur tel que le frontend le connaît (voir `User` dans src/types). */
export type UtilisateurPublic = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: Role;
} & Record<string, unknown>;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: Configuration,
  ) {}

  async connecter(email: string, motDePasse: string) {
    const utilisateur = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Même réponse pour un compte absent et un mot de passe faux : ne pas
    // révéler quelles adresses existent.
    const valide =
      utilisateur?.passwordHash && (await compare(motDePasse, utilisateur.passwordHash));
    if (!utilisateur || !valide) throw new UnauthorizedException('Identifiants incorrects');
    return this.ouvrir(utilisateur);
  }

  async connecterDemo(utilisateurId: string) {
    if (!this.config.connexionDemo) {
      throw new ForbiddenException('La connexion de démonstration est désactivée sur ce serveur');
    }
    const utilisateur = await this.prisma.user.findUnique({ where: { id: utilisateurId } });
    if (!utilisateur) throw new UnauthorizedException('Compte de démonstration inconnu');
    return this.ouvrir(utilisateur);
  }

  async profil(session: Session): Promise<UtilisateurPublic> {
    const utilisateur = await this.prisma.user.findUnique({ where: { id: session.id } });
    if (!utilisateur) throw new UnauthorizedException('Compte supprimé');
    return this.versPublic(utilisateur);
  }

  /** Vérifie un jeton et en extrait la session. Lève une 401 s'il est invalide. */
  async verifier(jeton: string): Promise<Session> {
    try {
      const charge = await this.jwt.verifyAsync<{ sub: string; role: Role; bankId?: string }>(jeton);
      return { id: charge.sub, role: charge.role, bankId: charge.bankId };
    } catch {
      throw new UnauthorizedException('Jeton invalide ou expiré');
    }
  }

  private async ouvrir(utilisateur: User) {
    const publicUser = this.versPublic(utilisateur);
    const bankId = typeof publicUser.bankId === 'string' ? publicUser.bankId : undefined;
    const jeton = await this.jwt.signAsync({ sub: utilisateur.id, role: utilisateur.role, bankId });
    return { jeton, utilisateur: publicUser };
  }

  private versPublic(utilisateur: User): UtilisateurPublic {
    const profil = (utilisateur.profile ?? {}) as Record<string, unknown>;
    return {
      ...profil,
      id: utilisateur.id,
      email: utilisateur.email,
      name: utilisateur.name,
      phone: utilisateur.phone,
      role: utilisateur.role as Role,
    };
  }
}
