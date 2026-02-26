import { SetMetadata } from '@nestjs/common'

export interface PermissionRequirement {
  resource: string
  action: 'read' | 'write' | 'delete' | '*'
}

export const PERMISSION_KEY = 'permission'
export const RequirePermission = (requirement: PermissionRequirement) =>
  SetMetadata(PERMISSION_KEY, requirement)








