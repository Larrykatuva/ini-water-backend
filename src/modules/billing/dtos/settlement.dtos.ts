import { ApiProperty } from '@nestjs/swagger';
import { Purpose, Target } from '../entities/settlement.entity';
import { IsNotEmpty } from 'class-validator';
import { CommonDto } from '../../shared/dtos/shared.dto';
import { OrganizationResDto } from '../../onboarding/dtos/organization.dto';
import { ProviderResDto } from '../../settings/dtos/dtos';
import { StationResDto } from '../../onboarding/dtos/station.dto';

export class SettlementReqDto {
  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty({ message: 'Organization is required' })
  organizationId: number;

  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty({ message: 'Provider is required' })
  providerId: number;

  @ApiProperty({ type: Number })
  stationId: number;

  @ApiProperty({ enum: Target, required: true })
  @IsNotEmpty({ message: 'Target is required' })
  target: Target;

  @ApiProperty({ enum: Purpose, required: true })
  @IsNotEmpty({ message: 'Purpose is required' })
  purpose: Purpose;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty({ message: 'Account number is required' })
  accountNumber: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty({ message: 'Account reference is required' })
  reference: string;

  @ApiProperty({ type: String })
  description: string;
}

export class SettlementUpdateDto {
  @ApiProperty({ type: Number })
  organizationId: number;

  @ApiProperty({ type: Number })
  providerId: number;

  @ApiProperty({ type: Number })
  stationId: number;

  @ApiProperty({ enum: Target })
  target: Target;

  @ApiProperty({ enum: Purpose })
  purpose: Purpose;

  @ApiProperty({ type: String })
  accountNumber: string;

  @ApiProperty({ type: String })
  reference: string;

  @ApiProperty({ type: String })
  description: string;

  @ApiProperty({ type: Boolean })
  active: boolean;
}

export class SettlementResDto extends CommonDto {
  @ApiProperty({ type: OrganizationResDto })
  organization: OrganizationResDto;

  @ApiProperty({ type: ProviderResDto })
  provider: ProviderResDto;

  @ApiProperty({ type: StationResDto })
  station: StationResDto;

  @ApiProperty({ enum: Target })
  target: Target;

  @ApiProperty({ enum: Purpose })
  purpose: Purpose;

  @ApiProperty({ type: String })
  accountNumber: string;

  @ApiProperty({ type: String })
  reference: string;

  @ApiProperty({ type: String })
  description: string;

  @ApiProperty({ type: Boolean })
  active: boolean;
}
