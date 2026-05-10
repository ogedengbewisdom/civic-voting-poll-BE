import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { IJwtPayload } from '../../common/interface/jwt.payload';
import { JwtService } from '@nestjs/jwt';
import { StateService } from '../state/state.service';
import { ForgotPasswordDto } from './dto/forgot.password.dto';
import { MailService } from '../mail/mail.service';
import { StringValue } from 'ms';
import { ResetPasswordDto } from './dto/reset.password.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private users_service: UsersService,
    private state_service: StateService,
    private jwt_service: JwtService,

    private mail_service: MailService,
  ) {}

  async register(register_user_dto: CreateUserDto) {
    const { password, ...rest } = register_user_dto;

    const state = await this.state_service.findOne(register_user_dto.state_id);
    if (!state) throw new NotFoundException('State not found');
    const existing_user = await this.users_service.find_by_email(
      register_user_dto.email,
    );
    if (existing_user) throw new ConflictException('User already exists');
    const hashed_password = await bcrypt.hash(password, 10);
    const user = await this.users_service.create({
      ...rest,
      password: hashed_password,
    });

    return user.id;
  }

  async login(login_user_dto: LoginUserDto) {
    const { email, password } = login_user_dto;
    const user = await this.users_service.find_by_email(email);
    if (!user) throw new UnauthorizedException(`Invalid credentials`);
    const valid_password = await bcrypt.compare(password, user.password);

    if (!valid_password) throw new UnauthorizedException(`Invalid credentials`);

    const payload: IJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      state_id: user.state_id,
      state: user.state.name,
    };

    return this.jwt_service.sign(payload);
  }

  async forgot_password(forgot_password_dto: ForgotPasswordDto) {
    const { email } = forgot_password_dto;
    const user = await this.users_service.find_by_email(email);
    if (!user) return 'If this email exists, a reset link has been sent';
    const token = this.jwt_service.sign(
      { email: user.email },
      {
        expiresIn: process.env[
          'JWT_RESET_PASSWORD_EXPIRATION_TIME'
        ] as StringValue,
        secret: process.env['JWT_RESET_PASSWORD_SECRET'] as string,
      },
    );

    await this.mail_service.send_reset_password_link(email, token);
    return 'If this email exists, a reset link has been sent';
  }

  async reset_password(
    reset_password_dto: ResetPasswordDto,
    token: string,
  ): Promise<boolean> {
    const { password, confirm_password } = reset_password_dto;
    if (password !== confirm_password)
      throw new BadRequestException('Passwords do not match');
    const decoded = this.jwt_service.verify(token, {
      secret: process.env['JWT_RESET_PASSWORD_SECRET'] as string,
    });

    if (!decoded) throw new UnauthorizedException('Invalid token');
    const { email } = decoded;
    const user = await this.users_service.find_by_email(email);
    if (!user) throw new NotFoundException('User not found');
    const hashed_password = await bcrypt.hash(password, 10);
    const user_id = user.id;

    try {
      const updated = await this.users_service.update_password(
        user_id,
        hashed_password,
      );
      return updated;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to reset password',
      );
    }
  }
}
