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

export class DataDto {
  @ApiProperty({ type: String })
  phone_number: string;

  @ApiProperty({ type: String })
  account_name: string;

  @ApiProperty({ type: String })
  code: string;
}

export class MobileReqDto {
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

  @ApiProperty({ type: DataDto })
  data: DataDto;
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
