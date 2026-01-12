import { Module } from '@nestjs/common';
import { ScripayService } from './scripay.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [ScripayService],
  exports: [ScripayService],
})
export class ScripayModule {}
