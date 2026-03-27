import { CommonEntity } from '../../shared/entites/common.entity';
import { Column, Entity, Index } from 'typeorm';

export enum SignInMethod {
  SignUp = 'SignUp',
  Google = 'Google',
  Facebook = 'Facebook',
}

@Entity()
export class User extends CommonEntity {
  @Column({ type: String })
  @Index()
  email: string;

  @Column({ type: String, nullable: true })
  @Index()
  phoneNumber: string;

  @Column({ type: String })
  fullName: string;

  @Column({ type: String, nullable: true })
  profile: string;

  @Column({ type: Boolean, default: false })
  emailVerified: boolean;

  @Column({ type: Boolean, default: false })
  verified: boolean;

  @Column({ type: Boolean, default: true })
  active: boolean;

  @Column({ type: Boolean, default: false })
  phoneVerified: boolean;

  @Column({ type: Boolean, default: false })
  twoFactorEnabled: boolean;

  @Column({ type: String, nullable: true, select: false })
  password: string;

  @Column({ type: Boolean, default: false })
  isStaff: boolean;

  @Column({ enum: SignInMethod, default: SignInMethod.SignUp })
  signInMethod: SignInMethod;
}
