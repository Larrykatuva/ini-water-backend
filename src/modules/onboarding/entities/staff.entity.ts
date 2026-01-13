import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../shared/entites/common.entity';
import { Organization } from './organization.entity';
import { Account } from './account.entity';
import { Invite } from './invite.entity';

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

  @ManyToOne(() => Invite, (invite: Invite) => invite.id, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  invite: Invite;

  @Column({ type: String })
  fullName: string;

  @Column({ type: String })
  title: string;

  @Column({ type: Boolean, default: true })
  active: boolean;

  @Column({ type: String, nullable: true })
  profile: string;
}
