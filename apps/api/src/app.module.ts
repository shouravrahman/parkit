import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { join } from 'path'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './common/prisma/prisma.module'
import { QueueModule } from './common/queue/queue.module'
import { UsersModule } from './models/users/users.module'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './common/auth/jwt.strategy'
import { AdminsModule } from './models/admins/admins.module'
import { CustomersModule } from './models/customers/customers.module'
import { ManagersModule } from './models/managers/managers.module'
import { ValetsModule } from './models/valets/valets.module'
import { CompaniesModule } from './models/companies/companies.module'
import { GaragesModule } from './models/garages/garages.module'
import { AddressesModule } from './models/addresses/addresses.module'
import { SlotsModule } from './models/slots/slots.module'
import { BookingsModule } from './models/bookings/bookings.module'
import { ValetAssignmentsModule } from './models/valet-assignments/valet-assignments.module'
import { BookingTimelinesModule } from './models/booking-timelines/booking-timelines.module'
import { ReviewsModule } from './models/reviews/reviews.module'
import { VerificationsModule } from './models/verifications/verifications.module'
import { StripeModule } from './models/stripe/stripe.module'
import { NotificationsModule } from './models/notifications/notifications.module'
import { AuthModule } from './models/auth/auth.module'
import { InvitesModule } from './models/invites/invites.module'
import { PubSubModule } from './common/pubsub/pubsub.module'
import { TenantMiddleware } from './common/tenant/tenant.middleware'

// Todo: Move this to util lib.
const MAX_AGE = 24 * 60 * 60

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => {
        const secret = process.env.JWT_SECRET
        if (!secret) {
          throw new Error('Missing JWT_SECRET environment variable')
        }
        return {
          global: true,
          secret,
          signOptions: { expiresIn: MAX_AGE },
        }
      },
      inject: [],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [JwtModule],
      inject: [JwtService],
      useFactory: (jwtService: JwtService) => ({
        introspection: true,
        fieldResolverEnhancers: ['guards'],
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        subscriptions: {
          'graphql-ws': {
            onConnect: (context: any) => {
              const { connectionParams } = context
              const token = (connectionParams?.['Authorization'] as string)?.split(' ')[1]

              if (token) {
                const payload = jwtService.decode(token)
                return { user: payload }
              }
            },
          },
        },
        context: ({ req, res, connection }) => {
          if (connection) {
            return { req: connection.context, res }
          }
          return { req, res }
        },
      }),
    }),

    PrismaModule,
  QueueModule,
    PubSubModule,

    StripeModule,

    UsersModule,
    AdminsModule,
    CustomersModule,
    ManagersModule,
    ValetsModule,
    CompaniesModule,
    GaragesModule,
    AddressesModule,
    SlotsModule,
    BookingsModule,
    ValetAssignmentsModule,
    BookingTimelinesModule,
    ReviewsModule,
    VerificationsModule,
    NotificationsModule,
    AuthModule,
    InvitesModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
