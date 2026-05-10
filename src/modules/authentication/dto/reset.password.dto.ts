import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @ApiProperty({
        example: 'password',
        description: 'The new password of the user',
    })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({
        example: 'password',
        description: 'The confirm password of the user',
    })
    @IsString()
    @MinLength(8)
    confirm_password: string;
}