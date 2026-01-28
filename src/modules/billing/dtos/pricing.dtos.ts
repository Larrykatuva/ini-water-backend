import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PricingUnits } from '../entities/pricing.entity';
import { CommonDto } from '../../shared/dtos/shared.dto';
import {
  AccountResDto,
  OrganizationResDto,
} from '../../onboarding/dtos/organization.dto';
import { StationResDto } from '../../onboarding/dtos/station.dto';

export class PricingReqDto {
  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty({ message: 'Organization is required' })
  organizationId: number;

  @ApiProperty({ type: Number })
  stationId: number;

  @ApiProperty({ enum: PricingUnits, required: true })
  units: PricingUnits;

  @ApiProperty({ type: Number })
  discrepancy: number;

  @ApiProperty({ type: Number })
  supplierPrice: number;

  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty({ message: 'Selling price is required' })
  sellingPrice: number;
}

export class PricingUpdateDto {
  @ApiProperty({ type: Number })
  organizationId: number;

  @ApiProperty({ type: Number })
  stationId: number;

  @ApiProperty({ enum: PricingUnits })
  units: PricingUnits;

  @ApiProperty({ type: Number })
  discrepancy: number;

  @ApiProperty({ type: Number })
  supplierPrice: number;

  @ApiProperty({ type: Number })
  sellingPrice: number;

  @ApiProperty({ type: Boolean })
  active: boolean;
}

export class PricingResDto extends CommonDto {
  @ApiProperty({ type: OrganizationResDto })
  organization: OrganizationResDto;

  @ApiProperty({ type: StationResDto })
  station: StationResDto;

  @ApiProperty({ type: AccountResDto })
  account: AccountResDto;

  @ApiProperty({ type: Date })
  archivedOn: Date;

  @ApiProperty({ enum: PricingUnits })
  units: PricingUnits;

  @ApiProperty({ type: Number })
  discrepancy: number;

  @ApiProperty({ type: Number })
  supplierPrice: number;

  @ApiProperty({ type: Number })
  sellingPrice: number;

  @ApiProperty({ type: Boolean })
  active: boolean;
}
