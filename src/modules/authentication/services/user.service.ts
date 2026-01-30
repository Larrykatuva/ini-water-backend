import { EntityService } from '../../shared/services/entity.service';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm/repository/Repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService extends EntityService<User> {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super();
    super.setRepository(this.userRepository);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: [{ email: username }, { phoneNumber: username }],
      select: [
        'id',
        'email',
        'phoneNumber',
        'fullName',
        'profile',
        'emailVerified',
        'verified',
        'active',
        'phoneVerified',
        'twoFactorEnabled',
        'password',
        'isStaff',
        'signInMethod',
        'createdAt',
        'updatedAt',
      ],
    });
  }
}
