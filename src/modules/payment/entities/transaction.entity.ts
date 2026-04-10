import { CommonEntity } from '../../shared/entites/common.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Organization } from '../../onboarding/entities/organization.entity';
import { Station } from '../../onboarding/entities/station.entity';
import { Reading } from '../../billing/entities/reading.entities';
import { Account } from '../../onboarding/entities/account.entity';
import { Provider } from '../../settings/entities/provider.entity';
import { Settlement } from '../../billing/entities/settlement.entity';

export enum TransactionPurpose {
  General = 'General',
  Incoming = 'Incoming',
  Settlement = 'Settlement',
}

export enum TransactionStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Failed = 'Failed',
  Success = 'Success',
  Reversed = 'Reversed',
}

@Entity()
export class Transaction extends CommonEntity {
  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.id,
    {
      onDelete: 'CASCADE',
    },
  )
  organization: Organization;

  @Column({ type: String })
  accountNumber: string;

  @Column({ type: String })
  orderId: string;

  @Column({ type: String, nullable: true })
  checkoutId: string;

  @Column({ type: String, nullable: true })
  providerRef: string;

  @Column({ enum: TransactionPurpose, default: TransactionPurpose.General })
  purpose: TransactionPurpose;

  @ManyToOne(() => Provider, (provider: Provider) => provider.id)
  provider: Provider;

  @Column({ type: 'decimal', precision: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 2, default: 0 })
  fees: number;

  @ManyToOne(() => Station, (station: Station) => station.id, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  station: Station;

  @ManyToOne(() => Reading, (reading: Reading) => reading.id, {
    nullable: true,
  })
  reading: Reading;

  @ManyToOne(() => Settlement, (settlement: Settlement) => settlement.id, {
    nullable: true,
  })
  settlement: Settlement;

  @ManyToOne(() => Account, (account: Account) => account.id, {
    nullable: true,
  })
  actionBy: Account;

  @Column({ enum: TransactionStatus, default: TransactionStatus.Pending })
  status: TransactionStatus;
}
