import { SetMetadata } from '@nestjs/common';
import { RolUser } from '../generated/prisma/client.js';

export const Roles = (...roles: RolUser[]) => SetMetadata('roles', roles);