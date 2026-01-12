import { CommonEntity } from '../../shared/entites/common.entity';
import { Column, Entity, Index, ManyToOne, Unique } from 'typeorm';
import { User } from './user.entity';

export enum Purpose {
  Registration = 'Registration',
  PhoneVerification = 'PhoneVerification',
  EmailVerification = 'EmailVerification',
  ResetPassword = 'ResetPassword',
  AccountInvite = 'AccountInvite',
  AccountLogin = 'AccountLogin',
}

@Entity()
@Unique(['purpose', 'code'])
export class Code extends CommonEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ enum: Purpose })
  purpose: Purpose;

  @Column({ type: String })
  @Index()
  code: string;

  @Column({ type: Boolean, default: false })
  used: boolean;

  @Column({ type: Date })
  expiry: Date;
}
