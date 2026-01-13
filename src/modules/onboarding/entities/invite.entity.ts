import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../shared/entites/common.entity';
import { Organization } from './organization.entity';
import { Account } from './account.entity';

export enum InviteStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  EXPIRED = 'Expired',
  REVOKED = 'Revoked',
}

@Entity()
export class Invite extends CommonEntity {
  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.id,
    { onDelete: 'CASCADE' },
  )
  @Index()
  organization: Organization;

  @Column()
  email: string;

  @ManyToOne(() => Account, (account: Account) => account.id, {
    onDelete: 'CASCADE',
  })
  actionBy: Account;

  @Column({ enum: InviteStatus, default: InviteStatus.PENDING })
  status: InviteStatus;
}
