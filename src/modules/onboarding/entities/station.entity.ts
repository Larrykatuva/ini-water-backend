import { CommonEntity } from '../../shared/entites/common.entity';
import { Column, Entity, Index, ManyToOne, Unique } from 'typeorm';
import { Organization } from './organization.entity';
import * as constants from 'node:constants';

@Entity()
@Unique(['name', 'organization'])
export class Station extends CommonEntity {
  @ManyToOne(() => Organization, (organization) => organization.id, {
    onDelete: 'CASCADE',
  })
  @Index()
  organization: Organization;

  @Column({ type: String })
  name: string;

  @Column({ type: String })
  code: string;

  @Column({ type: String })
  location: string;

  @Column({ type: Boolean, default: true })
  status: boolean;

  @Column({ type: String, nullable: true })
  profile: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}
