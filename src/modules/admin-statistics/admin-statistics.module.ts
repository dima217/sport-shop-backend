import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminStatisticsService } from './admin-statistics.service';
import { AdminStatisticsController } from './admin-statistics.controller';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, Category])],
  controllers: [AdminStatisticsController],
  providers: [AdminStatisticsService],
  exports: [AdminStatisticsService],
})
export class AdminStatisticsModule {}

