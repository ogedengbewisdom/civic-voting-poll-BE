import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class TransformParamDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  id: number;
}
