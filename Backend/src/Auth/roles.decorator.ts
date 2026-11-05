import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY, RolEfectivo } from './roles.js';

export const Roles = (...roles: RolEfectivo[]) =>
  SetMetadata(ROLES_KEY, roles);