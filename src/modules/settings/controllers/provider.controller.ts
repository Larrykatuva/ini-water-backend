import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { PaginatedResponsePipe } from '../../shared/pipes/paginated-response.pipe';
import { ProviderResDto } from '../dtos/dtos';
import { SearchFields } from '../../shared/pipes/search-fields.pipe';
import { OrderingFields } from '../../shared/pipes/ordering-fields.pipe';
import { PaginationDecorator } from '../../shared/decorators/pagination.decorator';
import type { DefaultPagination } from '../../shared/dtos/shared.dto';
import { QueryDecorator } from '../../shared/decorators/query.decorator';
import { OrderingDecorator } from '../../shared/decorators/ordering.decorator';
import { ProviderService } from '../services/provider.service';
import { Provider } from '../entities/provider.entity';

@ApiTags('Settings')
@Controller('settings')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Get('providers')
  @PaginatedResponsePipe(ProviderResDto, HttpStatus.OK)
  @SearchFields(
    Provider.name,
    'id',
    'name',
    'code',
    'swiftCode',
    'payBill',
    'country__id',
  )
  @OrderingFields(Provider.name, 'id', 'createdAt')
  async getProviders(
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
  ): Promise<[Provider[], number]> {
    return await this.providerService.paginatedFilter(pagination, query, {
      order: ordering,
    });
  }
}
