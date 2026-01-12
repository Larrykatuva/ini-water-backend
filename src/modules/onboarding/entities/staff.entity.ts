import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../shared/entites/common.entity';
import { Organization } from './organization.entity';
import { Account } from './account.entity';

@Entity()
export class Staff extends CommonEntity {
  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.id,
    { onDelete: 'CASCADE' },
  )
  @Index()
  organization: Organization;

  @ManyToOne(() => Account, (account: Account) => account.id, {
    onDelete: 'CASCADE',
  })
  @Index()
  account: Account;

  @Column({ type: String })
  fullName: string;

  @Column({ type: String })
  title: string;

  @Column({ type: Boolean, default: true })
  active: boolean;

  @Column({ type: String, nullable: true })
  profile: string;
}
