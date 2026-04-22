import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './entities/banner.entity';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { TranslationModule } from '../translation/translation.module';

@Module({
  imports: [TypeOrmModule.forFeature([Banner]), TranslationModule],
  controllers: [BannerController],
  providers: [BannerService],
  exports: [BannerService],
})
export class BannerModule {}
