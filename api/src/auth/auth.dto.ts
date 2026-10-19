import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ConnexionDto {
  @ApiProperty({ example: 'admin@cresus.sn' })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  motDePasse: string;
}

export class ConnexionDemoDto {
  @ApiProperty({ example: '1', description: 'Identifiant du compte de démonstration' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  utilisateurId: string;
}
