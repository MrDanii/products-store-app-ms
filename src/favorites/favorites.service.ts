import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { ProductFavoriteDto } from './dto';
import { NATS_SERVICE } from 'src/config';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class FavoritesService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('Favorites')

  constructor(
    @Inject(NATS_SERVICE) private readonly natsClient: ClientProxy
  ) {
    super()
  }

  onModuleInit() {
    this.$connect()
    this.logger.log('Database and Favorites service connected')
  }

  private async createFavoriteTable(addFavoriteDto: ProductFavoriteDto) {
    const { idUser, productId } = addFavoriteDto

    return await this.favoriteProducts.create({
      data: { userIdUser: idUser, productsList: [productId] }
    })
  }

  private async updateFavoriteTable(idFavorites: number, productsList: string[]) {
    return await this.favoriteProducts.update({
      data: { productsList },
      where: { idFavorites: idFavorites }
    })
  }

  async addFavorite(productFavoriteDto: ProductFavoriteDto) {
    const { idUser, productId } = productFavoriteDto

    try {
      // call products service to verify if product exists
      const productsVerified = await firstValueFrom(this.natsClient.send('products.validate', [productId]))
      const favoriteExists = await this.favoriteProducts.findUnique({
        where: { userIdUser: idUser }
      })

      if (!favoriteExists) {
        return await this.createFavoriteTable(productFavoriteDto)
      } else {
        const newProductsIds: string[] = favoriteExists.productsList.includes(productId)
          ? favoriteExists.productsList
          : favoriteExists.productsList.concat([productId])

        return await this.updateFavoriteTable(favoriteExists.idFavorites, newProductsIds)
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async findFavorites(idUser: string) {
    try {
      const favorites = await this.favoriteProducts.findFirst({
        where: { userIdUser: idUser },
        select: {
          listName: true,
          productsList: true
        }
      })

      if (!favorites || favorites.productsList.length === 0) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `User with id [${idUser}] does not have any favorites`
        })
      }

      return (favorites) ? favorites : []
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async removeFavorite(productFavoriteDto: ProductFavoriteDto) {
    const { idUser, productId } = productFavoriteDto

    try {
      // call products service to verify if product exists
      const productsVerified = await firstValueFrom(this.natsClient.send('products.validate', [productId]))
      const favoritesExists = await this.favoriteProducts.findUnique({
        where: { userIdUser: idUser }
      })

      if (!favoritesExists) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `can not remove product with id [${productId}] list of products does not exists`
        })
      }
      // Removing product ID
      const newProductsIds: string[] = favoritesExists.productsList.filter((productDb) => (productDb !== productId))

      return await this.updateFavoriteTable(favoritesExists.idFavorites, newProductsIds)
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async removeAllFavorites(idUser: string) {
    try {
      await this.favoriteProducts.delete({
        where: {
          userIdUser: idUser
        }
      })

      return {
        status: HttpStatus.OK,
        message: `All favorites were removed`
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }
}
