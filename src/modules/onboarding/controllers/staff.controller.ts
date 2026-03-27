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
import { StaffService } from '../services/staff.service';
import { PaginatedResponsePipe } from '../../shared/pipes/paginated-response.pipe';

import { SearchFields } from '../../shared/pipes/search-fields.pipe';
import { OrderingFields } from '../../shared/pipes/ordering-fields.pipe';
import { Staff } from '../entities/staff.entity';
import { StaffReqDto, StaffResDto, StaffUpdateDto } from '../dtos/staff.dto';
import {
  RequestUser,
  RequestUserAccount,
} from '../../authentication/decorators/auth.decorator';
import { User } from '../../authentication/entities/user.entity';
import { Account } from '../entities/account.entity';
import { PaginationDecorator } from '../../shared/decorators/pagination.decorator';
import {
  type DefaultPagination,
  MessageResDto,
} from '../../shared/dtos/shared.dto';
import { QueryDecorator } from '../../shared/decorators/query.decorator';
import { OrderingDecorator } from '../../shared/decorators/ordering.decorator';
import { deepMerge } from '../../shared/services/utility.service';
import { SetPermission } from '../../authorization/entities/permission.entity';
import { AllowedPermissions } from '../../authorization/decorators/permissions.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponsePipe } from '../../shared/pipes/response.pipe';

@ApiTags('Onboarding')
@Controller('onboarding')
@UseGuards(AuthGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('staffs')
  @PaginatedResponsePipe(StaffResDto, HttpStatus.OK)
  @SearchFields(
    Staff.name,
    'id',
    'title',
    'active',
    'organization__id',
    'organization__code',
    'account__id',
  )
  @OrderingFields(Staff.name, 'id', 'createdAt')
  async getStaffs(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
  ): Promise<[Staff[], number]> {
    return await this.staffService.paginatedFilter(
      pagination,
      deepMerge(query, this.staffService.staffFilter(user, account)),
      {
        order: ordering,
        relations: { organization: true, account: { user: true } },
      },
    );
  }

  @Post('staffs')
  @UseInterceptors(FileInterceptor('profile'))
  @ResponsePipe(MessageResDto, HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @AllowedPermissions(SetPermission.ManageStaff)
  async addStaff(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Body() payload: StaffReqDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MessageResDto> {
    return await this.staffService.addStaff(user, account, payload, file);
  }

  @Get('staff/:id')
  @ResponsePipe(StaffResDto, HttpStatus.OK)
  async getStaff(
    @Param('id') id: number,
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
  ): Promise<Staff> {
    const staff = await this.staffService.filter(
      deepMerge({ id: id }, this.staffService.staffFilter(user, account)),
      { relations: { organization: true, account: { user: true } } },
    );

    if (!staff) throw new BadRequestException('Staff not found');

    return staff;
  }

  @Patch('staff/:id')
  @ResponsePipe(MessageResDto, HttpStatus.OK)
  @UseInterceptors(FileInterceptor('profile'))
  @ApiConsumes('multipart/form-data')
  @AllowedPermissions(SetPermission.ManageStaff)
  async updateStaff(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Body() payload: StaffUpdateDto,
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: number,
  ): Promise<MessageResDto> {
    return await this.staffService.updateStaff(
      id,
      user,
      account,
      payload,
      file,
    );
  }
}
