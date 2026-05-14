import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../shared/services/cache.service';
import {
  ChargesReqDto,
  ChargesResDto,
  MobileDataDto,
  PaymentReqDto,
  ProfileResDto,
  StatusReqDto,
  StatusResDto,
  TokenReqDto,
  TokenResDto,
  TransactionResDto,
  WalletDataDto,
  WalletReqDto,
  WalletResDto,
} from './scripay.dto';
import {
  RequestContentType,
  RequestService,
} from '../shared/services/request.service';
import { parse } from 'ts-jest';

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

  async getFeeCharges(amount: string, type: string): Promise<ChargesResDto> {
    const { data } = await this.requestService.postRequest<
      ChargesReqDto,
      ChargesResDto
    >(
      `${this.baseUrl}/gateway/initiate/charges`,
      {
        amount: parseFloat(amount),
        transaction_type: type,
      },
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
    relativeUrl: string,
  ): Promise<TransactionResDto> {
    const { data } = await this.requestService.postRequest<
      PaymentReqDto<MobileDataDto>,
      TransactionResDto
    >(
      `${this.baseUrl}/gateway/initiate/collection`,
      {
        purpose: 'payment',
        order_id: orderId,
        amount: amount,
        description: 'Inibyte water collection',
        callback_url:
          this.configService.get<string>('SCRIPAY_CALLBACK') + relativeUrl,
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

  async initiateTransfer(
    walletFrom: string,
    walletTo: string,
    amount: string,
    orderId: string,
  ): Promise<TransactionResDto> {
    const { data } = await this.requestService.postRequest<
      PaymentReqDto<WalletDataDto>,
      TransactionResDto
    >(
      `${this.baseUrl}/gateway/initiate/p2p`,
      {
        purpose: 'payment',
        order_id: orderId,
        amount: parseFloat(amount),
        callback_url:
          this.configService.get<string>('SCRIPAY_CALLBACK') +
          '/callback/settlement',
        description: 'Inibyte water settlement',
        wallet: this.configService.get<string>('SCRIPAY_SETTLEMENT_WALLET'),
        channel: 'Wallet',
        data: {
          wallet_from: walletFrom,
          code: '1001',
        },
      },
      RequestContentType.JSON,
      await this.getAccessToken(),
    );

    return data;
  }

  async initiatePayout(
    walletFrom: string,
    orderId: string,
    amount: string,
    phoneNumber?: string,
    accountNumber?: string,
    reference?: string,
  ): Promise<TransactionResDto> {
    const payload = {
      code: '2001',
    };
    if (phoneNumber) {
      payload['phone_number'] = phoneNumber;
    } else {
      payload['account_number'] = accountNumber;
      if (reference) payload['account_ref'] = reference;
    }

    const { data } = await this.requestService.postRequest<
      PaymentReqDto<object>,
      TransactionResDto
    >(
      `${this.baseUrl}/gateway/initiate/payout`,
      {
        purpose: 'payment',
        order_id: orderId,
        amount: parseFloat(amount),
        callback_url:
          this.configService.get<string>('SCRIPAY_CALLBACK') +
          '/callback/settlement',
        description: 'Inibyte water settlement',
        wallet: walletFrom,
        channel: 'Paybill',
        data: payload,
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
