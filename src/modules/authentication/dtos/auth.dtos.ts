import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Purpose } from '../entities/code.entity';
import { UserResDto } from './user.dtos';
import { User } from '../entities/user.entity';
import { Account } from '../../onboarding/entities/account.entity';

export class RegisterReqDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email address is not valid' })
  email: string;

  @ApiProperty({ type: String, required: true, minLength: 9, maxLength: 12 })
  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNumber: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @ApiProperty({ type: String, required: true, minLength: 8 })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class VerifyOtpReqDto {
  @ApiProperty({ type: String, required: true, maxLength: 6, minLength: 6 })
  @IsNotEmpty({ message: 'Otp code is required' })
  otp: string;

  @ApiProperty({ enum: Purpose, default: Purpose.Registration })
  purpose: Purpose;

  @ApiProperty({ type: String })
  password: string;
}

export class LoginReqDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export enum TokenType {
  AccessToken = 'AccessToken',
  RefreshToken = 'RefreshToken',
}

export class LoginResDto {
  @ApiProperty({ type: String })
  accessToken: string;

  @ApiProperty({ type: String })
  refreshToken: string;

  @ApiProperty({ type: UserResDto })
  user: User;

  @ApiProperty({ type: String })
  expiresIn: string;

  @ApiProperty()
  account?: Account;
}

export class RequestCodeReqDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ enum: Purpose, required: true })
  @IsNotEmpty({ message: 'Purpose is required' })
  purpose: Purpose;
}

export class SwitchAccountDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty({ message: 'Account is required' })
  accountId: number;
}

export class GoogleAuthResDto {
  @ApiProperty({ type: String, required: true })
  url: string;
}

export enum AuthDevice {
  Web = 'Web',
  Android = 'Android',
  iOS = 'iOS',
}

export class AuthCodeReqDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty({ message: 'Code is required' })
  code: string;

  @ApiProperty({ type: String, default: AuthDevice.Web })
  device: AuthDevice.Web;
}

export class RefreshTokenReqDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty({ message: 'refreshToken is required' })
  refreshToken: string;
}
