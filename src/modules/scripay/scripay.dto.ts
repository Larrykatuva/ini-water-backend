import { ApiProperty } from '@nestjs/swagger';

export class TokenReqDto {
  @ApiProperty({ type: String })
  client_id?: string;

  @ApiProperty({ type: String })
  client_secret?: string;
}

export class TokenResDto {
  @ApiProperty({ type: String })
  client_idd: string;

  @ApiProperty({ type: String })
  access_token: string;

  @ApiProperty({ type: Number })
  expires_in: number;
}

export class MobileDataDto {
  @ApiProperty({ type: String })
  phone_number: string;

  @ApiProperty({ type: String })
  account_name: string;

  @ApiProperty({ type: String })
  code: string;
}

export class WalletDataDto {
  @ApiProperty({ type: String })
  wallet_from: string;

  @ApiProperty({ type: String })
  code: string;
}

export class PaymentReqDto<T> {
  @ApiProperty({ type: String })
  purpose: string;

  @ApiProperty({ type: String })
  order_id: string;

  @ApiProperty({ type: Number })
  amount: number;

  @ApiProperty({ type: String })
  callback_url?: string;

  @ApiProperty({ type: String })
  description: string;

  @ApiProperty({ type: String })
  wallet?: string;

  @ApiProperty({ type: String })
  channel: string;

  @ApiProperty()
  data: T;
}

export class TransactionResDto {
  @ApiProperty({ type: String })
  rrn: string;

  @ApiProperty({ type: Number })
  amount: number;

  @ApiProperty({ type: String })
  order_id: string;

  @ApiProperty({ type: String })
  narration: string;

  @ApiProperty({ type: String })
  purpose: string;

  @ApiProperty({ type: String })
  currency: string;
}

export enum TransStatus {
  Pending = 'Pending',
  Success = 'Success',
  Failed = 'Failed',
  Reversed = 'Reversed',
  Processing = 'Processing',
}

export class StatusReqDto {
  @ApiProperty({ type: String })
  rrn: string;
}

export class StatusResDto {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  order_id: string;

  @ApiProperty({ type: String })
  rrn: string;

  @ApiProperty({ type: Number })
  amount: number;

  @ApiProperty({ type: Number })
  fee: number;

  @ApiProperty({ enum: TransStatus })
  status: TransStatus;

  @ApiProperty({ type: String })
  narration: string;

  @ApiProperty({ type: String })
  provider_ref: string;
}

export class ProfileResDto {
  @ApiProperty({ type: String })
  id: number;
}

export class WalletReqDto {
  @ApiProperty({ type: String })
  profile_id: number;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  description: string;

  @ApiProperty({ type: String })
  currency: string;
}

export class WalletResDto extends WalletReqDto {
  @ApiProperty({ type: String })
  number: string;

  @ApiProperty({ type: String })
  id: number;
}

export enum ChargeType {
  B2B_payout = 'B2B Payout',
  Mobile_Collection = 'Mobile Collection',
  B2C_Payout = 'B2C Payout',
  Wallet_Transfer = 'Wallet Transfer',
}

export class ChargesReqDto {
  @ApiProperty({ type: Number })
  amount: number;

  @ApiProperty({ type: String })
  transaction_type: string;
}

export class ChargesResDto extends ChargesReqDto {
  @ApiProperty({ type: Number })
  fee: number;

  @ApiProperty({ type: String })
  bearer: string;
}
