import { Column, Entity, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../shared/entites/common.entity';
import { Organization } from '../../onboarding/entities/organization.entity';
import { Account } from '../../onboarding/entities/account.entity';
import { Pricing } from './pricing.entity';

@Entity()
export class Reading extends CommonEntity {
  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.id,
    { onDelete: 'CASCADE' },
  )
  organization: Organization;

  @ManyToOne(() => Pricing, (pricing: Pricing) => pricing.id, {
    onDelete: 'CASCADE',
  })
  pricing: Pricing;

  @Column({ type: 'decimal', precision: 2 })
  volumeSold: number;

  @Column({ type: Date })
  date: Date;

  @ManyToOne(() => Account, (account: Account) => account.id, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  actionBy: Account;
}
