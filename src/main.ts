import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { winston_config } from './common/logger/winston.config';
import { HttpErrorFilter } from './common/filter/http-error/http-error.filter';
import { HttpResponseInterceptor } from './common/interceptor/http-response/http-response.interceptor';
import { AuthGuard } from './common/guard/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winston_config,
  });

  const jwt_service = app.get(JwtService);
  const reflector = app.get(Reflector);

  app.enableCors({
    origin: process.env['FE_BASE_URL'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.use(helmet());

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalGuards(new AuthGuard(reflector, jwt_service));
  app.useGlobalFilters(new HttpErrorFilter());
  app.useGlobalInterceptors(new HttpResponseInterceptor());

  const v1_api_config = new DocumentBuilder()
    .setTitle('Civic Poll')
    .setDescription('API for Civic Voting Poll')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();
  const v1_api_document = SwaggerModule.createDocument(app, v1_api_config, {
    include: [],
  });
  SwaggerModule.setup('api/v1/docs', app, v1_api_document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
