import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '../../authentication/guards/auth.guard';
import { StationService } from '../services/station.service';
import { PaginatedResponsePipe } from '../../shared/pipes/paginated-response.pipe';
import {
  StationReqDto,
  StationResDto,
  StationUpdateDto,
} from '../dtos/station.dto';
import { SearchFields } from '../../shared/pipes/search-fields.pipe';
import { OrderingFields } from '../../shared/pipes/ordering-fields.pipe';
import { Station } from '../entities/station.entity';
import {
  RequestUser,
  RequestUserAccount,
} from '../../authentication/decorators/auth.decorator';
import { User } from '../../authentication/entities/user.entity';
import { Account } from '../entities/account.entity';
import { PaginationDecorator } from '../../shared/decorators/pagination.decorator';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import type { DefaultPagination } from '../../shared/dtos/shared.dto';
import { QueryDecorator } from '../../shared/decorators/query.decorator';
import { deepMerge } from '../../shared/services/utility.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponsePipe } from '../../shared/pipes/response.pipe';
import { AllowedPermissions } from '../../authorization/decorators/permissions.decorator';
import { SetPermission } from '../../authorization/entities/permission.entity';
import { OrderingDecorator } from '../../shared/decorators/ordering.decorator';

@ApiTags('Onboarding')
@Controller('onboarding')
@UseGuards(AuthGuard)
export class StationController {
  constructor(private readonly stationService: StationService) {}

  @Get('stations')
  @PaginatedResponsePipe(StationResDto, HttpStatus.OK)
  @SearchFields(
    Station.name,
    'id',
    'name',
    'organization__id',
    'organization__code',
  )
  @OrderingFields(Station.name, 'id', 'createdAt')
  async getStations(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
  ): Promise<[Station[], number]> {
    return await this.stationService.paginatedFilter(
      pagination,
      deepMerge(query, this.stationService.stationFilter(user, account)),
      { relations: { organization: true }, order: ordering },
    );
  }

  @Post('stations')
  @UseInterceptors(FileInterceptor('profile'))
  @ResponsePipe(MessageResDto, HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @AllowedPermissions(SetPermission.ManageStations)
  async addStation(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Body() payload: StationReqDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MessageResDto> {
    return await this.stationService.registerStation(
      payload,
      user,
      account,
      file,
    );
  }

  @Get('station/:id')
  @ResponsePipe(StationResDto, HttpStatus.OK)
  async getStation(
    @Param('id') id: number,
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
  ): Promise<Station> {
    const station = await this.stationService.filter(
      deepMerge({ id: id }, this.stationService.stationFilter(user, account)),
      { relations: { organization: true } },
    );

    if (!station) throw new BadRequestException('Station not found');

    return station;
  }

  @Patch('station/:id')
  @ResponsePipe(MessageResDto, HttpStatus.OK)
  @UseInterceptors(FileInterceptor('profile'))
  @ApiConsumes('multipart/form-data')
  @AllowedPermissions(SetPermission.ManageStations)
  async updateStation(
    @Param('id') id: number,
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Body() payload: StationUpdateDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MessageResDto> {
    return await this.stationService.updateStation(
      id,
      payload,
      user,
      account,
      file,
    );
  }
}
