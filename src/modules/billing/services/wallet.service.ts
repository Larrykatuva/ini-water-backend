import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { Wallet } from '../entities/wallet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Account } from '../../onboarding/entities/account.entity';
import { FindOptionsWhere } from 'typeorm';
import { WalletReqDto } from '../dtos/wallet.dtos';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import { deepMerge } from '../../shared/services/utility.service';
import { OrganizationService } from '../../onboarding/services/organization.service';
import { StationService } from '../../onboarding/services/station.service';
import { User } from '../../authentication/entities/user.entity';
import { ScripayService } from '../../scripay/scripay.service';
import { WalletResDto } from '../../scripay/scripay.dto';

@Injectable()
export class WalletService extends EntityService<Wallet> {
  constructor(
    @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
    private readonly organizationService: OrganizationService,
    private readonly stationService: StationService,
    private readonly scripayService: ScripayService,
  ) {
    super();
    super.setRepository(this.walletRepository);
  }

  walletFilter(account: Account): FindOptionsWhere<Account> {
    if (account.isStaff) return {};
    return { organization: { id: account.organization.id } };
  }

  async registerWallet(payload: WalletReqDto): Promise<WalletResDto> {
    const profile = await this.scripayService.getProfile();

    return await this.scripayService.registerWallet({
      profile_id: profile.id,
      name: payload.name,
      description: payload.name,
      currency: payload.currency,
    });
  }

  async createWallet(
    payload: WalletReqDto,
    account: Account,
    user: User,
  ): Promise<MessageResDto> {
    if (
      await this.filter(
        deepMerge(
          {
            organization: { id: payload.organizationId },
            station: { id: payload.stationId },
            currency: payload.currency,
          } as Partial<Wallet>,
          this.walletFilter(account),
        ),
      )
    )
      throw new BadRequestException('Wallet already registered');

    const organization = await this.organizationService.filter(
      deepMerge(
        { id: payload.organizationId },
        this.organizationService.organizationFilter(user, account),
      ),
    );
    if (!organization) throw new BadRequestException('Organization not found');

    const station = await this.stationService.filter(
      deepMerge(
        { id: payload.stationId },
        this.stationService.stationFilter(user, account),
      ),
    );
    if (!station) throw new BadRequestException('Station not found');

    const wallet = await this.registerWallet(payload);

    await this.save({
      organization: organization,
      station: station,
      currency: payload.currency,
      name: payload.name,
      number: wallet.number,
      walletId: parseInt(wallet.number),
    });

    return { message: 'Wallet registered successfully.' };
  }
}
