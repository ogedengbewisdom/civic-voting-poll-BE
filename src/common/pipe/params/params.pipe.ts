// import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

// @Injectable()
// export class ParamsPipe implements PipeTransform {
//   transform(value: string) {
//     if (value.trim() === '') return null;

//     const val = parseInt(value.trim(), 10);

//     if (isNaN(val)) throw new BadRequestException('Invalid parameter');
//     return val;
//   }
// }
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParamsPipe implements PipeTransform {
  transform(value: unknown) {
    if (value === null || value === undefined) {
      throw new BadRequestException('Parameter is required');
    }

    const stringValue = String(value).trim();

    if (stringValue === '') {
      throw new BadRequestException('Parameter cannot be empty');
    }

    const val = parseInt(stringValue, 10);

    if (isNaN(val)) {
      throw new BadRequestException('Invalid parameter');
    }

    return val;
  }
}