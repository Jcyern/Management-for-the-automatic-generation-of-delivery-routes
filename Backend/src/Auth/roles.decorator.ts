import { SetMetadata } from '@nestjs/common';
import { Rol } from '../generated/prisma/client.js';

export const Roles = (...roles: Rol[]) => SetMetadata('roles', roles);