import { Module } from '@nestjs/common'

import { PrismaModule } from 'src/common/prisma/prisma.module'
// JwtModule is registered globally in AppModule (JwtModule.registerAsync).
// Importing JwtModule here ensures the JwtService token is resolvable
// in this module's context without re-registering configuration.
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
