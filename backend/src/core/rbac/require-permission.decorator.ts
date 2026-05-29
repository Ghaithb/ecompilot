import { SetMetadata } from '@nestjs/common';
import { PermissionKey } from './permissions';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermission = (...permissions: PermissionKey[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
