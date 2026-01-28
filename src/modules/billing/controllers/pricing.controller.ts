import { ApiTags } from '@nestjs/swagger';
import { PricingService } from '../services/pricing.services';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../authentication/guards/auth.guard';
import { ResponsePipe } from '../../shared/pipes/response.pipe';
import {
  type DefaultPagination,
  MessageResDto,
} from '../../shared/dtos/shared.dto';
import { AllowedPermissions } from '../../authorization/decorators/permissions.decorator';
import { SetPermission } from '../../authorization/entities/permission.entity';
import {
  RequestUser,
  RequestUserAccount,
} from '../../authentication/decorators/auth.decorator';
import { User } from '../../authentication/entities/user.entity';
import { Account } from '../../onboarding/entities/account.entity';
import {
  PricingReqDto,
  PricingResDto,
  PricingUpdateDto,
} from '../dtos/pricing.dtos';
import { PaginatedResponsePipe } from '../../shared/pipes/paginated-response.pipe';
import { PaginationDecorator } from '../../shared/decorators/pagination.decorator';
import { QueryDecorator } from '../../shared/decorators/query.decorator';
import { OrderingDecorator } from '../../shared/decorators/ordering.decorator';
import { deepMerge } from '../../shared/services/utility.service';
import { Pricing } from '../entities/pricing.entity';

@ApiTags('Billing')
@Controller('billing')
@UseGuards(AuthGuard)
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('pricings')
  @ResponsePipe(MessageResDto, HttpStatus.CREATED)
  @AllowedPermissions(SetPermission.SetPricing)
  async configurePricing(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Body() payload: PricingReqDto,
  ): Promise<MessageResDto> {
    return await this.pricingService.setPricing(user, account, payload);
  }

  @Get('pricings')
  @PaginatedResponsePipe(PricingResDto, HttpStatus.OK)
  async getPricings(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
  ): Promise<[Pricing[], number]> {
    return await this.pricingService.paginatedFilter(
      pagination,
      deepMerge(query, this.pricingService.pricingFilter(user, account)),
      { order: ordering, relations: { organization: true, station: true } },
    );
  }

  @Get('pricing/:id')
  @ResponsePipe(PricingResDto, HttpStatus.OK)
  async getPricing(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Param('id') id: number,
  ): Promise<Pricing> {
    const pricing = await this.pricingService.filter(
      deepMerge({ id: id }, this.pricingService.pricingFilter(user, account)),
    );
    if (!pricing) throw new BadRequestException('Pricing not Found');

    return pricing;
  }

  @Patch('pricing/:id')
  @ResponsePipe(MessageResDto, HttpStatus.OK)
  async updatePricing(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Param('id') id: number,
    @Body() payload: PricingUpdateDto,
  ): Promise<MessageResDto> {
    return this.pricingService.updatePricing(id, payload, user, account);
  }
}
