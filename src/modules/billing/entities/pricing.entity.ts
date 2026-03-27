import { Column, Entity, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../shared/entites/common.entity';
import { Station } from '../../onboarding/entities/station.entity';
import { Account } from '../../onboarding/entities/account.entity';
import { Organization } from '../../onboarding/entities/organization.entity';

export enum PricingUnits {
  Cubic_Meter = 'M³',
  Cubic_Centimeter = 'CM³',
}

@Entity()
export class Pricing extends CommonEntity {
  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.id,
    { onDelete: 'CASCADE' },
  )
  organization: Organization;

  @ManyToOne(() => Station, (station: Station) => station.id, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  station: Station;

  @Column({ enum: PricingUnits, default: PricingUnits.Cubic_Meter })
  units: PricingUnits;

  @Column({ type: 'decimal', default: 0, precision: 2 })
  discrepancy: number;

  @Column({ type: 'decimal', precision: 2 })
  supplierPrice: number;

  @Column({ type: 'decimal', precision: 2 })
  sellingPrice: number;

  @Column({ type: Boolean, default: false })
  active: boolean;

  @Column({ type: Date, nullable: true })
  archivedOn: Date;

  @ManyToOne(() => Account, (account: Account) => account.id, {
    onDelete: 'CASCADE',
  })
  account: Account;
}
