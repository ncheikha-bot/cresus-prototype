import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConnexionDemoDto, ConnexionDto } from './auth.dto';
import { AuthService } from './auth.service';
import { Publique, Session, SessionCourante } from './session';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Publique()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Connexion par adresse et mot de passe' })
  connecter(@Body() corps: ConnexionDto) {
    return this.auth.connecter(corps.email, corps.motDePasse);
  }

  @Publique()
  @Post('demo')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Connexion à un compte de démonstration, sans mot de passe',
    description: "Refusée si le serveur n'a pas été lancé avec DEMO_LOGIN=true.",
  })
  connecterDemo(@Body() corps: ConnexionDemoDto) {
    return this.auth.connecterDemo(corps.utilisateurId);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Compte associé au jeton' })
  profil(@SessionCourante() session: Session) {
    return this.auth.profil(session);
  }
}
