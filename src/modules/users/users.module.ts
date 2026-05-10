import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
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
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
