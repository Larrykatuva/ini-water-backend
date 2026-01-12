import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../shared/entites/common.entity';
import { Station } from './station.entity';
import { Organization } from './organization.entity';
import { Account } from './account.entity';
import { Staff } from './staff.entity';

@Entity()
export class Attendant extends CommonEntity {
  @ManyToOne(() => Station, (station: Station) => station.id, {
    onDelete: 'CASCADE',
  })
  @Index()
  station: Station;

  @ManyToOne(() => Account, (account: Account) => account.id, {
    onDelete: 'CASCADE',
  })
  @Index()
  account: Account;

  @ManyToOne(() => Staff, (staff: Staff) => staff.id, { onDelete: 'CASCADE' })
  @Index()
  staff: Staff;

  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.id,
    { onDelete: 'CASCADE' },
  )
  @Index()
  organization: Organization;

  @Column({ type: Boolean, default: false })
  active: boolean;
}
