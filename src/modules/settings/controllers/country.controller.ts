import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { CountryService } from '../services/country.service';
import { PaginatedResponsePipe } from '../../shared/pipes/paginated-response.pipe';
import { CountryResDto } from '../dtos/dtos';
import { Country } from '../entities/country.entity';
import { PaginationDecorator } from '../../shared/decorators/pagination.decorator';
import type { DefaultPagination } from '../../shared/dtos/shared.dto';
import { QueryDecorator } from '../../shared/decorators/query.decorator';
import { OrderingDecorator } from '../../shared/decorators/ordering.decorator';
import { SearchFields } from '../../shared/pipes/search-fields.pipe';
import { OrderingFields } from '../../shared/pipes/ordering-fields.pipe';

@ApiTags('Settings')
@Controller('settings')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get('countries')
  @PaginatedResponsePipe(CountryResDto, HttpStatus.OK)
  @SearchFields(Country.name, 'id', 'name', 'code')
  @OrderingFields(Country.name, 'id', 'createdAt')
  async getCountries(
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
  ): Promise<[Country[], number]> {
    return await this.countryService.paginatedFilter(pagination, query, {
      order: ordering,
    });
  }
}
