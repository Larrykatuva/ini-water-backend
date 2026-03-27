import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../shared/entites/common.entity';
import { Organization } from './organization.entity';
import { Account } from './account.entity';
import { RequirementType } from './requirement.entity';

export enum KycStatuses {
  Submitted = 'Submitted',
  InReview = 'In Review',
  CorrectionRequested = 'Correction Requested',
  Accepted = 'Accepted ',
}

@Entity()
export class KycStatus extends CommonEntity {
  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.id,
    { onDelete: 'CASCADE' },
  )
  @Index()
  organization: Organization;

  @ManyToOne(() => Account, (account: Account) => account.id, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  account: Account;

  @Column({ enum: RequirementType })
  type: RequirementType;

  @Column({ enum: KycStatuses, default: KycStatuses.Submitted })
  status: KycStatuses;
}
