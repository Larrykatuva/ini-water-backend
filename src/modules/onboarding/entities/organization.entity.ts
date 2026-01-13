import { CommonEntity } from '../../shared/entites/common.entity';
import { Column, Entity, Index } from 'typeorm';

export enum OrganizationStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum OrganizationAccess {
  PUBLIC = 'Public',
  PRIVATE = 'Private',
}

@Entity()
export class Organization extends CommonEntity {
  @Column({ type: String })
  @Index()
  name: string;

  @Column({ type: String })
  code: string;

  @Column({ type: String })
  description: string;

  @Column({ type: String })
  county: string;

  @Column({ type: String })
  subCountry: string;

  @Column({ type: String })
  logo: string;

  @Column({ type: String })
  area: string;

  @Column({ enum: OrganizationStatus })
  status: OrganizationStatus;

  @Column({ enum: OrganizationAccess })
  @Index()
  access: OrganizationAccess;

  @Column({ type: Boolean, default: false })
  restricted: boolean;
}
