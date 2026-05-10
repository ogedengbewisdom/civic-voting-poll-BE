import { UserRole } from '../../../common/interface/jwt.payload';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ example: 'admin', description: 'The role of the user' })
  @IsEnum(UserRole)
  role: UserRole;
}
