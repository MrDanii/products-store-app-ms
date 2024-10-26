import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { NatsModule } from 'src/transports/nats.module';
import { UserEditModule } from '../user-edit/user-edit.module';
import { AuthModule } from '../auth/auth.module';
import { ProductModule } from '../product/product.module';
import { UserAddressModule } from '../user-address/user-address.module';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    NatsModule, 
    UserEditModule,
    AuthModule,
    ProductModule,
    UserAddressModule,
    OrdersModule,
  ]
})
export class SeedModule {}
