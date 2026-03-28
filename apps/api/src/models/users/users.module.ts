import { Module } from '@nestjs/common'
import { UsersService } from './graphql/users.service'
import { UsersResolver } from './graphql/users.resolver'
import { UsersController } from './rest/users.controller'
import { AuthModule } from '../auth/auth.module'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [AuthModule, JwtModule],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
