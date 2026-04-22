import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BannerService } from './banner.service';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { Roles } from 'src/auth/common/decorators/role.decorator';

const BANNER_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', example: 'Summer Sale' },
    subtitle: { type: 'string', example: 'Up to 50% off on all items' },
    lang: { type: 'string', example: 'en' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

@ApiTags('Banner')
@Controller()
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  // ─── Public ───────────────────────────────────────────────────────────────

  @Get('banner')
  @ApiOperation({
    summary: 'Get banner text',
    description:
      'Returns the banner title and subtitle. ' +
      'Pass `lang` query parameter to receive the text translated into the requested language. ' +
      'If the language is not provided the text is returned in the original language.',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'BCP-47 language code to translate the banner into (e.g. "en", "de", "zh")',
    example: 'en',
  })
  @ApiResponse({
    status: 200,
    description: 'Banner content (translated when `lang` is specified)',
    schema: BANNER_RESPONSE_SCHEMA,
  })
  @ApiResponse({ status: 404, description: 'Banner has not been configured yet' })
  async getBanner(@Query('lang') lang?: string) {
    return this.bannerService.getBanner(lang);
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  @Put('admin/banner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update banner text (Admin only)',
    description:
      'Creates or replaces the banner title and subtitle. ' +
      'Provide `originalLang` to indicate the language of the submitted text (default: "ru"). ' +
      'All previously cached translations are invalidated automatically.',
  })
  @ApiResponse({
    status: 200,
    description: 'Banner updated successfully',
    schema: BANNER_RESPONSE_SCHEMA,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin role required' })
  async updateBanner(@Body() dto: UpdateBannerDto) {
    return this.bannerService.updateBanner(dto);
  }
}
