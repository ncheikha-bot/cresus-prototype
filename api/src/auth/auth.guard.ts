import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { JETON_EN_PARAMETRE, ROUTE_PUBLIQUE } from './session';

/** Toute route exige un jeton, sauf celles marquées `@Publique()`. */
@Injectable()
export class GardeAuthentification implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  async canActivate(contexte: ExecutionContext): Promise<boolean> {
    const publique = this.reflector.getAllAndOverride<boolean>(ROUTE_PUBLIQUE, [
      contexte.getHandler(),
      contexte.getClass(),
    ]);
    if (publique) return true;

    const requete = contexte.switchToHttp().getRequest();
    const entete: string | undefined = requete.headers.authorization;
    const parametreAdmis = this.reflector.getAllAndOverride<boolean>(JETON_EN_PARAMETRE, [
      contexte.getHandler(),
      contexte.getClass(),
    ]);

    const jeton = entete?.startsWith('Bearer ')
      ? entete.slice('Bearer '.length)
      : parametreAdmis && typeof requete.query?.token === 'string'
        ? requete.query.token
        : null;
    if (!jeton) throw new UnauthorizedException('Jeton manquant');

    requete.session = await this.auth.verifier(jeton);
    return true;
  }
}
