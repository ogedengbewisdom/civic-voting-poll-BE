import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  MinLength,
} from 'class-validator';

export class CreatePollDto {
  @ApiProperty({
    example: 'Presidential Election',
    description: 'The title of poll',
  })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({
    example: 'Choose your preferred candidate',
    description: 'The description of poll',
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({
    example: ['Peter Obi', 'Atiku', 'Tinubu'],
    description: 'An array of poll options',
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  poll_options: string[];
}
