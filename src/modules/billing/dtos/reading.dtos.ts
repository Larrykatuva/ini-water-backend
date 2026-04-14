import { CommonDto } from '../../shared/dtos/shared.dto';
import {
  AccountResDto,
  OrganizationResDto,
} from '../../onboarding/dtos/organization.dto';
import { ApiProperty } from '@nestjs/swagger';
import { PricingResDto } from './pricing.dtos';
import { StationResDto } from '../../onboarding/dtos/station.dto';
import { IsNotEmpty } from 'class-validator';

export class ReadingResDto extends CommonDto {
  @ApiProperty({ type: OrganizationResDto })
  organization: OrganizationResDto;

  @ApiProperty({ type: StationResDto })
  station: StationResDto;

  @ApiProperty({ type: PricingResDto })
  pricing: PricingResDto;

  @ApiProperty({ type: Number })
  volumeSold: number;

  @ApiProperty({ type: Date })
  date: Date;

  @ApiProperty({ type: AccountResDto })
  actionBy: AccountResDto;
}

export class ReadingReqDto {
  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty({ message: 'Station required' })
  stationId: number;

  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty({ message: 'Volume sold required' })
  volumeSold: number;
}

export class ReadingUpdateDto {
  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty({ message: 'Volume sold required' })
  volumeSold: number;
}
