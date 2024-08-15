import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [AuthModule, ProductModule, OrdersModule, CartModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
