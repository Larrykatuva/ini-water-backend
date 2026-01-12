import { Column, Entity, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../shared/entites/common.entity';
import { AuthType } from './permission.entity';
import { Organization } from '../../onboarding/entities/organization.entity';

/**
 * Default system role that are seeded on creation
 */
export enum SystemRoles {
  SystemAdmin = 'System Admin',
  AccountAdmin = 'Account Admin',
}

export const RoleSets: { name: SystemRoles; type: AuthType }[] = [
  { name: SystemRoles.SystemAdmin, type: AuthType.Internal },
  { name: SystemRoles.AccountAdmin, type: AuthType.External },
];

@Entity()
export class Role extends CommonEntity {
  @Column({ enum: AuthType, default: AuthType.External })
  type: AuthType;

  @Column({ type: String })
  name: string;

  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.id,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  organization: Organization;

  @Column({ type: Boolean, default: true })
  active: boolean;
}
