import { CommonEntity } from '../../shared/entites/common.entity';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { Account } from './account.entity';
import { Requirement } from './requirement.entity';
import { Organization, OrganizationStatus } from './organization.entity';

@Entity()
@Index(['organization', 'account'])
export class Kyc extends CommonEntity {
  @ManyToOne(() => Requirement, (requirement: Requirement) => requirement.id, {
    onDelete: 'CASCADE',
  })
  requirement: Requirement;

  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.id,
    {
      onDelete: 'CASCADE',
    },
  )
  @Index()
  organization: Organization;

  @ManyToOne(() => Account, (account: Account) => account.id, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  account: Account;

  @Column({ type: String })
  value: string;

  @Column({ type: Boolean, default: false })
  verified: boolean;

  @Column({ enum: OrganizationStatus, default: OrganizationStatus.PENDING })
  status: OrganizationStatus;

  @Column({ type: 'text', nullable: true })
  comment: string;
}
