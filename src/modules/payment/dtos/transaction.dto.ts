import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

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
