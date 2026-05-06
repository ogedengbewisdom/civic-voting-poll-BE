import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { JwtModule } from '@nestjs/jwt';
import { StringValue } from 'ms';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env['JWT_SECRET'] as string,
      signOptions: {
        expiresIn: process.env['JWT_EXPIRATION_TIME'] as StringValue,
      },
    }),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
