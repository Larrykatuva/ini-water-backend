import { ApiProperty } from '@nestjs/swagger';
import { CommonDto } from '../../shared/dtos/shared.dto';
import { OrganizationResDto } from '../../onboarding/dtos/organization.dto';
import { StationResDto } from '../../onboarding/dtos/station.dto';
import { ProviderResDto } from '../../settings/dtos/dtos';
import { IsNotEmpty } from 'class-validator';

export class WalletReqDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty({ message: 'Currency is required' })
  currency: string;

  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty({ message: 'Organization is required' })
  organizationId: number;

  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty({ message: 'Station is required' })
  stationId: number;

  @ApiProperty({ type: String })
  name: string;
}

export class WalletResDto extends CommonDto {
  @ApiProperty({ type: OrganizationResDto })
  organization: OrganizationResDto;

  @ApiProperty({ type: StationResDto })
  station: StationResDto;

  @ApiProperty({ type: ProviderResDto })
  provider: ProviderResDto;

  @ApiProperty({ type: Boolean })
  active: boolean;

  @ApiProperty({ type: String })
  number: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  currency: string;
}
