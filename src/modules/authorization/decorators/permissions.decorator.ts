import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { SetPermission } from '../entities/permission.entity';
import { PermissionsGuard } from '../guards/permissions.guard';
import { AuthGuard } from '../../authentication/guards/auth.guard';

/**
 * PERMISSIONS_KEY is a constant string that acts as the key for storing
 * permission-related metadata for routes or handlers.
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Permissions decorator to assign roles/permissions metadata to route handlers.
 *
 * This decorator allows you to specify which permissions (or roles) are required for
 * accessing a particular route handler. The permissions are stored as metadata using
 * the `SetMetadata` function and can be retrieved during route handling for access control.
 *
 * @returns A metadata decorator that attaches the roles/permissions to the handler.
 * @param permissions
 */
export const Permissions = (...permissions: SetPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * AllowedPermissions decorator to restrict access to a route handler
 * based on roles and permissions, and also use the AuthGuard for route protection.
 *
 * This decorator combines the `Permissions` decorator with the `AuthGuard`, ensuring
 * that the specified roles/permissions must be present for a user to access the route.
 * It protects the route and checks if the user has the required permissions.
 *
 * @returns A decorator that applies both the `Permissions` and `AuthGuard` to the handler.
 * @param permissions
 */
export const AllowedPermissions = (...permissions: SetPermission[]) => {
  return applyDecorators(
    UseGuards(AuthGuard),
    Permissions(...permissions),
    UseGuards(PermissionsGuard),
  );
};
