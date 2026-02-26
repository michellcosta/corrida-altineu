import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSION_KEY, PermissionRequirement } from '../decorators/permissions.decorator'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<PermissionRequirement>(
      PERMISSION_KEY,
      context.getHandler(),
    )

    if (!requiredPermission) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user || !user.permissions) {
      throw new ForbiddenException('Sem permissões')
    }

    const hasPermission = this.checkPermission(
      user.permissions,
      requiredPermission.resource,
      requiredPermission.action,
    )

    if (!hasPermission) {
      throw new ForbiddenException(
        `Permissão negada: ${requiredPermission.resource}:${requiredPermission.action}`,
      )
    }

    return true
  }

  private checkPermission(
    permissions: any[],
    resource: string,
    action: string,
  ): boolean {
    return permissions.some(
      (p) =>
        (p.resource === resource || p.resource === '*') &&
        (p.action === action || p.action === '*'),
    )
  }
}








