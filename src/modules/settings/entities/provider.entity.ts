import { CommonEntity } from '../../shared/entites/common.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Country } from './country.entity';

export enum ProviderTypes {
  Bank = 'Bank',
  Telco = 'Telco',
}

@Entity()
export class Provider extends CommonEntity {
  @ManyToOne(() => Country, (country: Country) => country.id)
  country: Country;

  @Column({ enum: ProviderTypes })
  type: ProviderTypes;

  @Column({ type: String })
  name: string;

  @Column({ type: String, unique: true })
  code: string;

  @Column({ type: Boolean, default: true })
  active: boolean;

  @Column({ type: String, nullable: true })
  logo: string;

  @Column({ type: String, nullable: true })
  swiftCode: string;

  @Column({ type: String, nullable: true })
  address: string;

  @Column({ type: String, nullable: true })
  payBill: string;
}
