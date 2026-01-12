import { Column, Entity, Index } from 'typeorm';
import { CommonEntity } from '../../shared/entites/common.entity';

export enum SetPermission {
  /**
   * Account permissions
   */
  InviteUser = 'Invite user',
  ViewInvites = 'View invites',
  ViewStaff = 'View staff members',
  ManageStaff = 'Manage staff members',
  ManageKyc = 'Manage account kyc',
  GenerateCredentials = 'Generate credentials',
  AccessCredentials = 'Access credentials',
  ManageAccount = 'Manage Account',

  /**
   * Authorization permissions
   */
  AssignRoles = 'Assigning roles',
  RevokeRoles = 'Revoke roles',
  CreateRoles = 'Create roles',
  UpdateRoles = 'Update roles',
  ManageRolePermissions = 'Manage role permissions',

  /**
   * Settings permissions
   */
  ConfigureSystemSettings = 'Configure system settings',

  /**
   * Billing permissions
   */
  ConfigurePackages = 'Configure packages',

  /**
   * Sending permissions
   */
  ManageShortCodes = 'Manage short codes',
}

export enum AuthType {
  External = 'External',
  Internal = 'Internal',
}

export const PermissionSets: {
  permission: SetPermission;
  type: AuthType;
}[] = [
  // Account permissions
  { permission: SetPermission.InviteUser, type: AuthType.External },
  { permission: SetPermission.ViewInvites, type: AuthType.External },
  { permission: SetPermission.ViewStaff, type: AuthType.External },
  { permission: SetPermission.ManageStaff, type: AuthType.External },
  { permission: SetPermission.ManageKyc, type: AuthType.External },
  { permission: SetPermission.GenerateCredentials, type: AuthType.External },
  { permission: SetPermission.AccessCredentials, type: AuthType.External },
  { permission: SetPermission.ManageAccount, type: AuthType.External },

  // Authorization permissions
  { permission: SetPermission.AssignRoles, type: AuthType.External },
  { permission: SetPermission.RevokeRoles, type: AuthType.External },
  { permission: SetPermission.CreateRoles, type: AuthType.External },
  { permission: SetPermission.UpdateRoles, type: AuthType.External },
  { permission: SetPermission.ManageRolePermissions, type: AuthType.External },

  // Settings permissions
  {
    permission: SetPermission.ConfigureSystemSettings,
    type: AuthType.Internal,
  },

  // Billing permissions
  { permission: SetPermission.ConfigurePackages, type: AuthType.Internal },

  // Sending permissions
  { permission: SetPermission.ManageShortCodes, type: AuthType.External },
];

@Entity()
export class Permission extends CommonEntity {
  @Column({ enum: SetPermission })
  @Index({ unique: true })
  name: SetPermission;

  @Column({ enum: AuthType, default: AuthType.External })
  type: AuthType;

  @Column({ type: Boolean, default: true })
  active: boolean;
}
