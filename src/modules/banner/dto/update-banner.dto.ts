import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional, Length } from 'class-validator';

export class UpdateBannerDto {
  @ApiProperty({
    description: 'Banner title text',
    example: 'Летняя распродажа',
    maxLength: 512,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  title: string;

  @ApiProperty({
    description: 'Banner subtitle text',
    example: 'Скидки до 50% на все товары',
    maxLength: 1024,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1024)
  subtitle: string;

  @ApiProperty({
    description: 'Language code of the text being submitted (BCP-47, e.g. "ru", "en", "es")',
    example: 'ru',
    required: false,
    default: 'ru',
  })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  originalLang?: string;
}
