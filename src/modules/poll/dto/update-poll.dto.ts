import { PartialType } from '@nestjs/mapped-types';
import { CreatePollDto } from './create-poll.dto';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// export class UpdatePollDto extends PartialType(CreatePollDto) {}

export class UpdatePollOptionDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsString()
  @IsNotEmpty()
  option_text: string;
}

export class UpdatePollDto {
  @ApiProperty({
    example: 'Presidential Election',
    description: 'The title of poll',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiProperty({
    example: 'Choose your preferred candidate',
    description: 'The description of poll',
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiProperty({
    example: [
      { id: 1, option_text: 'Peter Obi' },
      { id: 2, option_text: 'Atiku' },
      { id: 3, option_text: 'Tinubu' },
    ],
    description: 'An array of poll options',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePollOptionDto)
  @IsOptional()
  poll_options?: UpdatePollOptionDto[];
}
