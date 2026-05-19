import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Put,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleGuard } from '../../common/guard/role/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { UserRole } from '../../common/interface/jwt.payload';
// import { ParseIntPipe } from '../../common/pipe/params/params.pipe';
import type { Request } from 'express';
import type { IQueryPagination } from '../../common/interface/query';
import { AuthGuard } from '../../common/guard/auth/auth.guard';
import { AssignRoleDto } from './dto/assign-role.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly users_service: UsersService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users fetched successfully' })
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(@Query() query: IQueryPagination) {
    const data = await this.users_service.findAll(query);

    return {
      message: 'Users fetched successfully',
      data,
    };
  }

  @ApiOperation({ summary: 'Get a user profile' })
  @ApiResponse({ status: 200, description: 'User fetched successfully' })
  @Get('profile')
  async findOne(@Req() req: Request) {
    const user_id = req.user?.id as number;

    const user = await this.users_service.findOne(user_id);
    return {
      message: 'User fetched successfully',
      data: user,
    };
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  @Put('profile')
  async update(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const user_id = req.user?.id as number;
    const data = await this.users_service.update(user_id, updateUserDto);
    return {
      message: 'User profile updated successfully',
      data: data,
    };
  }

  @ApiOperation({ summary: 'Delete user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile deleted successfully',
  })
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':user_id')
  async remove(
    @Req() req: Request,
    @Param('user_id', ParseIntPipe) user_id: number,
  ) {
    const data = await this.users_service.remove(user_id);
    return {
      message: 'User profile deleted successfully',
      data: data,
    };
  }

  @ApiOperation({ summary: 'Restore user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile restored successfully',
  })
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @Patch('restore/:user_id')
  async restore(@Param('user_id', ParseIntPipe) user_id: number) {
    const data = await this.users_service.restore(user_id);
    return {
      message: 'User profile restored successfully',
      data: data,
    };
  }

  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({
    status: 200,
    description: 'Role assigned to user successfully',
  })
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @Patch('assign-role/:user_id')
  async assignRole(
    @Param('user_id', ParseIntPipe) user_id: number,
    @Body() assign_role_dto: AssignRoleDto,
  ) {
    const data = await this.users_service.assign_role(user_id, assign_role_dto);
    return {
      message: 'Role assigned to user successfully',
      data: data,
    };
  }
}
