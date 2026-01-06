import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/configuration';
import { UserModule } from './modules/user/user.module';
import { DatabaseModule } from './config/modules/database.module';
import { AppConfig } from './config/configuration.interface';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { CartModule } from './modules/cart/cart.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AdminStatisticsModule } from './modules/admin-statistics/admin-statistics.module';
import { WebSocketModule } from './modules/websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot<AppConfig>({
      load: [configuration],
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),

    DatabaseModule,

    AuthModule,
    UserModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    FavoritesModule,
    OrdersModule,
    ReviewsModule,
    AdminStatisticsModule,
    WebSocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
