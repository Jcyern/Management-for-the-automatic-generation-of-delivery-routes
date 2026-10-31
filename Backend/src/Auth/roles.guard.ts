import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUser } from '../generated/prisma/client.js';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<RolUser[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        
        if (!requiredRoles) return true;

        const { user } = context.switchToHttp().getRequest();
        
        if (!user || !requiredRoles.includes(user.rol)) {
            throw new ForbiddenException('No tienes permisos para realizar esta acción');
        }
        
        return true;
    }
}