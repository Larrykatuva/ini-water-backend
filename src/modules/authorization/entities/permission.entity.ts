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
   * Onboarding permissions
   */
  ManageOrganization = 'Manage organizations',
  ManageStations = 'Manage stations',
  ManageAttendants = 'Manage attendants',
  ManageRequirements = 'Manage requirements',

  /**
   * Billing permissions
   */
  SetPricing = 'Set pricing',
  SetReading = 'Set meter reading',
  ConfigureSettlement = 'Configure settlement accounts',
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

  // Onboarding permissions
  { permission: SetPermission.ManageOrganization, type: AuthType.Internal },
  { permission: SetPermission.ManageStations, type: AuthType.External },
  { permission: SetPermission.ManageAttendants, type: AuthType.External },
  { permission: SetPermission.ManageRequirements, type: AuthType.External },

  // Billing permissions
  { permission: SetPermission.SetPricing, type: AuthType.External },
  { permission: SetPermission.SetReading, type: AuthType.External },
  { permission: SetPermission.ConfigureSettlement, type: AuthType.Internal },
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
