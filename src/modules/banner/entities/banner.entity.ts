import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('banner')
export class Banner {
  @ApiProperty({ description: 'Banner record ID (always 1 — singleton)', example: 1 })
  @PrimaryColumn('int')
  id: number;

  @ApiProperty({
    description: 'Banner title in the original language (set by admin)',
    example: 'Летняя распродажа',
  })
  @Column({ type: 'varchar', length: 512 })
  title: string;

  @ApiProperty({
    description: 'Banner subtitle in the original language (set by admin)',
    example: 'Скидки до 50% на все товары',
  })
  @Column({ type: 'varchar', length: 1024 })
  subtitle: string;

  @ApiProperty({ description: 'Language code of the stored original text', example: 'ru' })
  @Column({ type: 'varchar', length: 10, default: 'ru' })
  originalLang: string;

  @ApiProperty({ description: 'Date when banner was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}
