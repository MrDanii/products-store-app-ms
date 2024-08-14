import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [AuthModule, ProductModule, OrdersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
