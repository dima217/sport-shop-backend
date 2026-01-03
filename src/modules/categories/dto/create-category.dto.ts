import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Одежда' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'URL of category image', example: 'https://example.com/image.jpg' })
  @IsNotEmpty()
  @IsUrl()
  image: string;

  @ApiProperty({ description: 'URL-friendly identifier', example: 'odezhda' })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Parent category ID (optional)', nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string | null;
}
