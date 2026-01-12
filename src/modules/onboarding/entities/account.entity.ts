import { CommonEntity } from '../../shared/entites/common.entity';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { Organization } from './organization.entity';
import { User } from '../../authentication/entities/user.entity';

export enum AccountStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

@Entity()
export class Account extends CommonEntity {
  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.id,
    { onDelete: 'CASCADE' },
  )
  @Index()
  organization: Organization;

  @ManyToOne(() => User, (user: User) => user.id, { onDelete: 'CASCADE' })
  @Index()
  user: User;

  @Column({ type: Boolean, default: false })
  active: boolean;

  @Column({ enum: AccountStatus, default: AccountStatus.PENDING })
  status: AccountStatus;

  @Column({ type: Boolean, default: false })
  isStaff: boolean;

  @Column({ type: Boolean, default: false })
  isNgo: boolean;
}
