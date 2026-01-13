import { CommonEntity } from '../../shared/entites/common.entity';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { Organization } from './organization.entity';

export enum RequirementType {
  ORGANIZATION = 'Organization',
  INDIVIDUAL = 'Individual',
}

export enum RequirementInput {
  FILE = 'File',
  TEXT = 'Text',
  NUMBER = 'Number',
}

@Entity()
export class Requirement extends CommonEntity {
  @Column({ enum: RequirementType })
  type: RequirementType;

  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.id,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  @Index()
  organization: Organization;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  comment: string;

  @Column({ enum: RequirementInput })
  input: RequirementInput;

  @Column({ type: Boolean, default: true })
  required: boolean;
}
