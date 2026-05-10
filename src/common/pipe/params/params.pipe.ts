import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParamsPipe implements PipeTransform {
  transform(value: string) {
    if (value.trim() === '') return null;

    const val = parseInt(value.trim(), 10);

    if (isNaN(val)) throw new BadRequestException('Invalid parameter');
    return val;
  }
}
