import { Column, Entity, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../shared/entites/common.entity';
import { Organization } from '../../onboarding/entities/organization.entity';
import { Reading } from '../../billing/entities/reading.entities';
import { Station } from '../../onboarding/entities/station.entity';
import { Account } from '../../onboarding/entities/account.entity';

@Entity()
export class Reconciliation extends CommonEntity {
  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.id,
  )
  organization: Organization;

  @ManyToOne(() => Station, (station: Station) => station.id)
  station: Station;

  @ManyToOne(() => Reading, (reading: Reading) => reading.id)
  reading: Reading;

  @Column({ type: Date })
  date: Date;

  @Column({ type: 'decimal', precision: 2 })
  expectedAmount: number;

  @Column({ type: 'decimal', precision: 2 })
  actualAmount: number;

  @Column({ type: 'decimal', precision: 2 })
  deficitAmount: number;

  @ManyToOne(() => Account, (account: Account) => account.id)
  account: Account;
}
