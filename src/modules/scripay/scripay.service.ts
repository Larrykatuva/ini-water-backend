import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../shared/services/cache.service';
import {
  MobileReqDto,
  ProfileResDto,
  StatusReqDto,
  StatusResDto,
  TokenReqDto,
  TokenResDto,
  TransactionResDto,
  WalletReqDto,
  WalletResDto,
} from './scripay.dto';
import {
  RequestContentType,
  RequestService,
} from '../shared/services/request.service';

@Injectable()
export class ScripayService {
  private readonly baseUrl: string | undefined;

  constructor(
    private configService: ConfigService,
    private cacheService: CacheService,
    private requestService: RequestService,
  ) {
    this.baseUrl = this.configService.get<string>('SCRIPAY_URL');
  }

  async getAccessToken(): Promise<string> {
    const cachedToken =
      await this.cacheService.get<TokenResDto>('-scripay-token-');
    if (cachedToken) return cachedToken.access_token;

    const { data } = await this.requestService.postRequest<
      TokenReqDto,
      TokenResDto
    >(
      `${this.baseUrl}/auth/access-token`,
      {
        client_id: this.configService.get<string>('SCRIPAY_CLIENT_ID'),
        client_secret: this.configService.get<string>('SCRIPAY_CLIENT_SECRET'),
      },
      RequestContentType.JSON,
    );

    await this.cacheService.save<TokenResDto>('-scripay-token', data);

    return data.access_token;
  }

  async getProfile(): Promise<ProfileResDto> {
    const { data } = await this.requestService.getRequest<ProfileResDto>(
      `${this.baseUrl}/gateway/profiles/profile/${this.configService.get<string>('SCRIPAY_USERNAME')}`,
      await this.getAccessToken(),
    );

    return data;
  }

  async registerWallet(payload: WalletReqDto): Promise<WalletResDto> {
    const { data } = await this.requestService.postRequest<
      WalletReqDto,
      WalletResDto
    >(
      `${this.baseUrl}/gateway/wallets/register`,
      payload,
      RequestContentType.JSON,
      await this.getAccessToken(),
    );

    return data;
  }

  async initiateStk(
    phoneNumber: string,
    orderId: string,
    amount: number,
    walletNumber: string,
  ): Promise<TransactionResDto> {
    const { data } = await this.requestService.postRequest<
      MobileReqDto,
      TransactionResDto
    >(
      `${this.baseUrl}/gateway/initiate/collection`,
      {
        purpose: 'payment',
        order_id: orderId,
        amount: amount,
        description: 'Inibyte float topup',
        callback_url: this.configService.get<string>('SCRIPAY_CALLBACK'),
        wallet: walletNumber,
        channel: 'Mpesa',
        data: {
          phone_number: phoneNumber,
          account_name: 'Inibyte',
          code: '2001',
        },
      },
      RequestContentType.JSON,
      await this.getAccessToken(),
    );

    return data;
  }

  async checkTransactionStatus(rrn: string): Promise<StatusResDto> {
    const { data } = await this.requestService.postRequest<
      StatusReqDto,
      StatusResDto
    >(
      `${this.baseUrl}/gateway/transactions/status`,
      {
        rrn: rrn,
      },
      RequestContentType.JSON,
      await this.getAccessToken(),
    );

    return data;
  }
}
