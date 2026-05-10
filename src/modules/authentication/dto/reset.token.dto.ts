import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResetTokenDto {
  @ApiProperty({
    example: 'password',
    description: 'The new password of the user',
  })
  @IsString()
  token: string;
}
