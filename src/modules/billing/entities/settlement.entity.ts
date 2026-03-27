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

  @Column({ type: String })
  accountNumber: string;

  @Column({ type: String })
  reference: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: Boolean, default: false })
  active: boolean;
}
