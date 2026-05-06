import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'open_for_all';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
