import { CommonEntity } from '../../shared/entites/common.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Provider } from '../../settings/entities/provider.entity';
import { Organization } from '../../onboarding/entities/organization.entity';
import { Station } from '../../onboarding/entities/station.entity';

@Entity()
export class Wallet extends CommonEntity {
  @ManyToOne(() => Provider, (provider: Provider) => provider.id)
  provider: Provider;

  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.id,
  )
  organization: Organization;

  @ManyToOne(() => Station, (station: Station) => station.id, {
    nullable: true,
  })
  station: Station;

  @Column({ type: Boolean, default: true })
  active: boolean;

  @Column({ type: String })
  number: string;

  @Column({ type: String })
  name: string;

  @Column({ type: String, default: 'KES' })
  currency: string;

  @Column({ type: Number })
  walletId: number;
}
