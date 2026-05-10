import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { JwtModule } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { UsersModule } from '../users/users.module';
import { StateModule } from '../state/state.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env['JWT_SECRET'] as string,
      signOptions: {
        expiresIn: process.env['JWT_EXPIRATION_TIME'] as StringValue,
      },
    }),
    UsersModule,
    StateModule,
    MailModule,
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
