import { Column, Entity, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../shared/entites/common.entity';
import { Organization } from '../../onboarding/entities/organization.entity';
import { Station } from '../../onboarding/entities/station.entity';
import { Provider } from '../../settings/entities/provider.entity';

export enum Target {
  Organization = 'Organization',
  Station = 'Station',
}

export enum Purpose {
  Bill = 'Bill',
  Profits = 'Profits',
  General = 'General',
  Charges = 'Charges',
}

export enum Strategy {
  Auto = 'Auto',
  Manual = 'Manual',
}

export enum Destination {
  Wallet = 'Wallet',
  PhoneNumber = 'PhoneNumber',
  Paybill = 'Paybill',
  Till = 'Till',
}

@Entity()
export class Settlement extends CommonEntity {
  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.id,
    { onDelete: 'CASCADE' },
  )
  organization: Organization;

  @Column({ enum: Target, default: Target.Organization })
  target: Target;

  @ManyToOne(() => Station, (station: Station) => station.id, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  station: Station;

  @Column({ enum: Purpose })
  purpose: Purpose;

  @ManyToOne(() => Provider, (provider: Provider) => provider.id, {
    onDelete: 'CASCADE',
  })
  provider: Provider;

  @Column({ enum: Destination, default: Destination.Wallet })
  destination: Destination;

  @Column({ enum: Strategy, default: Strategy.Auto })
  strategy: Strategy;

  @Column({ type: String })
  accountNumber: string;

  @Column({ type: String })
  reference: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: Boolean, default: false })
  active: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;
}
