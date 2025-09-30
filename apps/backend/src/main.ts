import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("ServiceDesk Pro API")
    .setDescription("Internal service desk platform API")
    .setVersion("1.0")
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api/docs", app, document)

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`🚀 Backend running on http://localhost:${port}`)
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap()
