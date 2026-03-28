import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import setupBullBoard from './tools/bullboard/bullboard'
const port = process.env.PORT || 3000

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // Mount Bull Board (queue dashboard) at /admin/queues (protected by basic auth)
  try {
    const server = app.getHttpAdapter().getInstance()
    setupBullBoard(server)
  } catch (err) {
    // non-fatal: if bull-board setup fails, continue without dashboard
    console.warn('Bull Board not mounted:', err)
  }
  app.enableCors()

  const config = new DocumentBuilder()
    .setTitle('Parkit')
    .setDescription(
      `The Parkit API.
<h2>Looking for the graphql api?</h2>
Go to <a href="/graphql" target="_blank">/graphql</a>.
Or,
You might also need to use the <a target="_blank" href="https://studio.apollographql.com/sandbox/explorer?endpoint=http://localhost:3000/graphql&document=query users{users{ uid }}
">Apollo explorer</a> for a greater experience.

      `,
    )
    .setVersion('0.1')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/', app, document)

  await app.listen(port, '0.0.0.0')
}
bootstrap()
