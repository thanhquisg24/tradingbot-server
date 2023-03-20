import { SetMetadata } from '@nestjs/common';
import { ROLE } from '../constants';

export const HasRoles = (...roles: ROLE[]) => SetMetadata('roles', roles);
