import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from '../../common/interface/jwt.payload';
import type { IQueryPagination } from '../../common/interface/query';
import { AssignRoleDto } from './dto/assign-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private user_repo: Repository<User>,
    private jwt_service: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const user = this.user_repo.create(createUserDto);
      await this.user_repo.save(user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to create user',
      );
    }
  }

  async findAll(query: IQueryPagination) {
    const { page = 1, limit = 10, search = '' } = query;
    try {
      const [data, total] = await this.user_repo.findAndCount({
        relations: { state: true },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          state: {
            name: true,
          },
          created_at: true,
          updated_at: true,
          deleted_at: true,
        },
        where: search
          ? {
              email: ILike(`%${search}%`),
            }
          : {},
        skip: (page - 1) * limit,
        take: limit,
      });

      const total_pages = Math.ceil(total / limit);
      const has_next_page = page < total_pages;
      return {
        data,
        total,
        page,
        limit,
        total_pages,
        has_next_page,
        has_previous_page: page > 1,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch users',
      );
    }
  }

  async find_by_email(email: string) {
    const user = await this.user_repo.findOne({
      where: { email },
      relations: {
        state: true,
      },
    });
    return user;
  }

  async find_by_id(id: number) {
    const user = await this.user_repo.findOne({
      where: { id },
      relations: { state: true },
    });
    return user;
  }

  async findOne(user_id: number) {
    try {
      const user = await this.user_repo.findOne({
        relations: { state: true },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          state: {
            name: true,
          },
          created_at: true,
          updated_at: true,
        },
        where: { id: user_id },
      });
      if (!user) throw new NotFoundException('User not found');
      // const is_authorized = user_id === user.id || user_role === UserRole.ADMIN;
      // if (!is_authorized) throw new ForbiddenException('Access denied');
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch user',
      );
    }
  }

  async update(user_id: number, updateUserDto: UpdateUserDto) {
    const user = await this.find_by_id(user_id);
    if (!user) throw new NotFoundException('User not found');
    try {
      await this.user_repo.update(user_id, updateUserDto);
      const updated_user = await this.find_by_id(user_id);
      if (!updated_user) throw new NotFoundException('User not found');
      const payload: IJwtPayload = {
        sub: updated_user.id,
        email: updated_user.email,
        role: updated_user.role,
        first_name: updated_user.first_name,
        last_name: updated_user.last_name,
        state_id: updated_user.state_id,
        state: updated_user.state.name,
      };
      return this.jwt_service.sign(payload);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Failed to update user',
      );
    }
  }

  async remove(user_id: number) {
    const user = await this.find_by_id(user_id);
    if (!user) throw new NotFoundException('User not found');
    try {
      await this.user_repo.softDelete(user_id);
      return user.id;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to delete user',
      );
    }
  }

  async restore(user_id: number) {
    const user = await this.user_repo.findOne({
      where: { id: user_id },
      withDeleted: true,
    });
    if (!user) throw new NotFoundException('User not found');
    try {
      await this.user_repo.restore(user_id);
      return user.id;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to restore user',
      );
    }
  }

  async assign_role(user_id: number, assign_role_dto: AssignRoleDto) {
    const user = await this.find_by_id(user_id);
    if (!user) throw new NotFoundException('User not found');
    try {
      await this.user_repo.update(user_id, { role: assign_role_dto.role });
      return user.id;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Failed to assign role',
      );
    }
  }

  async update_password(user_id: number, password: string) {
    const user = await this.find_by_id(user_id);
    if (!user) throw new NotFoundException('User not found');
    try {
      await this.user_repo.update(user_id, { password });
      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Failed to update password',
      );
    }
  }
}
