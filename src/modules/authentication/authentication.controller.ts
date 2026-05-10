import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ForgotPasswordDto } from './dto/forgot.password.dto';
import { ResetPasswordDto } from './dto/reset.password.dto';
import { ResetTokenDto } from './dto/reset.token.dto';

@ApiTags('Authentication')
@Controller({ path: 'auth', version: '1' })
export class AuthenticationController {
  constructor(private readonly auth_service: AuthenticationService) {}

  @Public()
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Register a new user',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @Post('register')
  async register(@Body() register_user_dto: CreateUserDto) {
    const user_id = await this.auth_service.register(register_user_dto);
    return {
      message: 'User registered successfully',
      data: user_id,
    };
  }

  @Public()
  @ApiOperation({
    summary: 'Login a user',
    description: 'Login a user',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() login_user_dto: LoginUserDto) {
    const token = await this.auth_service.login(login_user_dto);
    return {
      message: 'User logged in successfully',
      data: token,
    };
  }

  @Public()
  @ApiOperation({
    summary: 'Forgot password',
    description: 'Forgot password',
  })
  @ApiResponse({
    status: 200,
    description: 'Reset link sent successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgot_password(@Body() forgot_password_dto: ForgotPasswordDto) {
    const message =
      await this.auth_service.forgot_password(forgot_password_dto);
    return { message };
  }

  @Public()
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset password',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiParam({ name: 'token', type: String, required: true })
  @ApiBody({ type: ResetPasswordDto, required: true })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password/:token')
  async reset_password(
    @Param() { token }: ResetTokenDto,
    @Body() reset_password_dto: ResetPasswordDto,
  ) {
    const data = await this.auth_service.reset_password(
      reset_password_dto,
      token,
    );

    return { message: 'Password reset successfully', data };
  }
}
