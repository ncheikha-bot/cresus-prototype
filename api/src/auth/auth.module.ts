import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { Configuration } from '../config/configuration';
import { AuthController } from './auth.controller';
import { GardeAuthentification } from './auth.guard';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [Configuration],
      useFactory: (config: Configuration) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: config.dureeJeton as `${number}d` },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, { provide: APP_GUARD, useClass: GardeAuthentification }],
  exports: [AuthService],
})
export class AuthModule {}
