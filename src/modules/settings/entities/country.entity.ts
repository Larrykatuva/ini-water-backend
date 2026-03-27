import { Column, Entity } from 'typeorm';
import { CommonEntity } from '../../shared/entites/common.entity';

@Entity()
export class Country extends CommonEntity {
  @Column({ type: String })
  name: string;

  @Column({ type: String })
  code: string;

  @Column({ type: String, nullable: true })
  logo: string;
}
