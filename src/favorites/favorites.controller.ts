import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FavoritesService } from './favorites.service';
import { ProductFavoriteDto } from './dto/product-favorite.dto';

@Controller()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) { }

  @MessagePattern('favorite.add.one')
  addFavorite(@Payload() productFavoriteDto: ProductFavoriteDto) {
    return this.favoritesService.addFavorite(productFavoriteDto);
  }

  @MessagePattern('favorite.find.all')
  findFavorites(@Payload() idUser: string) {
    return this.favoritesService.findFavorites(idUser);
  }

  @MessagePattern('favorite.remove.one')
  removeFavorite(productFavoriteDto: ProductFavoriteDto) {
    return this.favoritesService.removeFavorite(productFavoriteDto);
  }

  @MessagePattern('favorite.remove.all')
  removeAllFavorites(idUser: string) {
    return this.favoritesService.removeAllFavorites(idUser);
  }

}
