import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [FavoritesController],
  providers: [FavoritesService],
  imports: [NatsModule]
})
export class FavoritesModule {}
