import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CommonDto } from '../../shared/dtos/shared.dto';
import {
  AccountResDto,
  OrganizationResDto,
} from '../../onboarding/dtos/organization.dto';
import {
  TransactionPurpose,
  TransactionStatus,
} from '../entities/transaction.entity';
import { StationResDto } from '../../onboarding/dtos/station.dto';
import { ReadingResDto } from '../../billing/dtos/reading.dtos';
import { SettlementResDto } from '../../billing/dtos/settlement.dtos';

export class TransactionReqDto {
  @ApiProperty({ type: String, minLength: 12, maxLength: 12 })
  @IsNotEmpty({ message: 'Phone number is required' })
  accountNumber: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty({ message: 'Reading is required' })
  readingId: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty({ message: 'Provider is required' })
  providerId: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;
}

export class TransactionResDto extends CommonDto {
  @ApiProperty({ type: OrganizationResDto })
  organization: OrganizationResDto;

  @ApiProperty({ type: String })
  accountNumber: string;

  @ApiProperty({ type: String, required: false })
  providerRef: string;

  @ApiProperty({ type: String })
  orderId: string;

  @ApiProperty({ enum: TransactionPurpose })
  purpose: TransactionPurpose;

  @ApiProperty({ type: Number })
  amount: number;

  @ApiProperty({ type: Number })
  fee: number;

  @ApiProperty({ type: StationResDto, required: false })
  station: StationResDto;

  @ApiProperty({ type: ReadingResDto, required: false })
  reading: ReadingResDto;

  @ApiProperty({ type: SettlementResDto, required: false })
  settlement: SettlementResDto;

  @ApiProperty({ type: AccountResDto, required: false })
  actionBy: AccountResDto;

  @ApiProperty({ enum: TransactionStatus })
  status: TransactionStatus;
}
