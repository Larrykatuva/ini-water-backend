import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { EmailService } from './services/email.service';

@Module({
  imports: [SharedModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
