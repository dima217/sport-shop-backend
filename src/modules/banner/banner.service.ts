import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { TranslationService } from '../translation/translation.service';

export interface BannerResponse {
  title: string;
  subtitle: string;
  lang: string;
  updatedAt: Date;
}

const BANNER_ID = 1;

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    private readonly translationService: TranslationService,
  ) {}

  async getBanner(lang?: string): Promise<BannerResponse> {
    const banner = await this.bannerRepository.findOne({ where: { id: BANNER_ID } });

    if (!banner) {
      throw new NotFoundException('Banner has not been configured yet');
    }

    const targetLang = (lang || banner.originalLang).toLowerCase().trim();

    if (targetLang === banner.originalLang.toLowerCase()) {
      return {
        title: banner.title,
        subtitle: banner.subtitle,
        lang: banner.originalLang,
        updatedAt: banner.updatedAt,
      };
    }

    const [title, subtitle] = await this.translationService.translateMany(
      [banner.title, banner.subtitle],
      banner.originalLang,
      targetLang,
    );

    return { title, subtitle, lang: targetLang, updatedAt: banner.updatedAt };
  }

  async updateBanner(dto: UpdateBannerDto): Promise<BannerResponse> {
    let banner = await this.bannerRepository.findOne({ where: { id: BANNER_ID } });

    if (banner) {
      banner.title = dto.title;
      banner.subtitle = dto.subtitle;
      banner.originalLang = dto.originalLang ?? 'ru';
    } else {
      banner = this.bannerRepository.create({
        id: BANNER_ID,
        title: dto.title,
        subtitle: dto.subtitle,
        originalLang: dto.originalLang ?? 'ru',
      });
    }

    const saved = await this.bannerRepository.save(banner);

    // Invalidate all cached translations when banner text changes
    this.translationService.clearCache();

    return {
      title: saved.title,
      subtitle: saved.subtitle,
      lang: saved.originalLang,
      updatedAt: saved.updatedAt,
    };
  }
}
