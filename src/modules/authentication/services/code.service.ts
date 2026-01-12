import { EntityService } from '../../shared/services/entity.service';
import { Code, Purpose } from '../entities/code.entity';
import { Repository } from 'typeorm/repository/Repository';
import { User } from '../entities/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CodeService extends EntityService<Code> {
  constructor(
    @InjectRepository(Code) private codeRepository: Repository<Code>,
  ) {
    super();
    super.setRepository(this.codeRepository);
  }

  generateCode(length: number = 6): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code: string = '';
    for (let i: number = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code.toUpperCase();
  }

  async generateOtp(
    user: User,
    purpose: Purpose,
    expiry: number = 60,
  ): Promise<Code> {
    const code: string = this.generateCode();
    if (await this.filter({ code: code, purpose: purpose }))
      return await this.generateOtp(user, purpose);
    return await this.save({
      user: user,
      code: code,
      purpose: purpose,
      expiry: new Date(new Date().getTime() + expiry * 1000),
    });
  }

  async verifyOtp(code: string, purpose: Purpose): Promise<User> {
    const otp = await this.filter(
      { purpose: purpose, code: code },
      { relations: { user: true } },
    );
    if (!otp) throw new BadRequestException('Invalid Otp code');
    if (otp.used)
      throw new BadRequestException('Otp code has already been used');
    if (otp.expiry.getTime() >= new Date().getTime())
      throw new BadRequestException('Otp code has already expired');
    await this.update({ id: otp.id }, { used: true });
    return otp.user;
  }
}
