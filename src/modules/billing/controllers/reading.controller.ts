import { ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ReadingService } from '../services/reading.service';
import { PaginatedResponsePipe } from '../../shared/pipes/paginated-response.pipe';
import { ReadingResDto } from '../dtos/reading.dtos';
import {
  RequestUser,
  RequestUserAccount,
} from '../../authentication/decorators/auth.decorator';
import { User } from '../../authentication/entities/user.entity';
import { Account } from '../../onboarding/entities/account.entity';
import { PaginationDecorator } from '../../shared/decorators/pagination.decorator';
import type { DefaultPagination } from '../../shared/dtos/shared.dto';
import { QueryDecorator } from '../../shared/decorators/query.decorator';
import { OrderingDecorator } from '../../shared/decorators/ordering.decorator';
import { Reading } from '../entities/reading.entities';
import { deepMerge } from '../../shared/services/utility.service';
import { ResponsePipe } from '../../shared/pipes/response.pipe';

@ApiTags('Billing')
@Controller('billing')
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  @Get('readings')
  @PaginatedResponsePipe(ReadingResDto, HttpStatus.OK)
  async getReadings(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
  ): Promise<[Reading[], number]> {
    return await this.readingService.paginatedFilter(
      pagination,
      deepMerge(query, this.readingService.readingFilter(user, account)),
      { order: ordering, relations: { organization: true, pricing: true } },
    );
  }

  @Get('reading/:id')
  @ResponsePipe(ReadingResDto, HttpStatus.OK)
  async getReading(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Param('id') id: number,
  ): Promise<Reading> {
    const reading = await this.readingService.filter(
      deepMerge({ id: id }, this.readingService.readingFilter(user, account)),
    );
    if (!reading) throw new BadRequestException('Reading not found');

    return reading;
  }
}
