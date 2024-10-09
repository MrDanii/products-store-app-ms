import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient, ProductCatalog, ShoppingCartDetails } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { AddCartDetailDto, UpdateCartItemDto } from './dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CartService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('Cart')

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy
  ) {
    super()
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Cart service and database connected')
  }

  async create(idUser: string) {
    try {
      const cartExists = await this.shoppingCart.findFirst({
        where: { userIdUser: idUser }
      })

      if (cartExists) {
        const cartUpdated = await this.shoppingCart.update({
          data: { updateAt: new Date() },
          where: { userIdUser: idUser }
        })
        return cartUpdated
      } else {
        const newCart = await this.shoppingCart.create({
          data: {
            userIdUser: idUser,
            updateAt: new Date()
          }
        })
        return newCart
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.messsage
      })
    }
  }

  async addCartDetail(addCartDetailDto: AddCartDetailDto) {
    const { idUser, idProduct, quantity, price } = addCartDetailDto
    try {
      //* 1.- Create Cart
      const userCart = await this.create(idUser)
      const idCart = userCart.idCart

      //* 2.- Add Items to Cart
      // 2.1 Verify products
      const productsIds: string[] = [idProduct]
      const verifiedProducts: ProductCatalog[] = await firstValueFrom(this.natsClient.send('products.validate', productsIds))

      // 2.2 verify if product already exists in shopping cart
      const cartDetailsDb = await this.shoppingCartDetails.findFirst({
        where: {
          AND: [
            { shoppingCartIdCart: idCart },
            { productCatalogIdProduct: idProduct }
          ]
        }
      })
      // if exists we add requested quantity to the current quantity in database
      let newQuantity: number = (cartDetailsDb) ? (cartDetailsDb.quantity + quantity) : quantity
      
      if (cartDetailsDb) {
        return await this.updateCartItem({idProduct, idUser, quantity: newQuantity})
      }

      // 2.3 verify prices and add item
      const cartDetail = await this.shoppingCartDetails.create({
        data: {
          shoppingCartIdCart: idCart,
          productCatalogIdProduct: idProduct,
          quantity: newQuantity,
          price: verifiedProducts.find((product) => (product.idProduct === idProduct)).price
        }
      })

      return cartDetail
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.messsage
      })
    }
  }

  async findAllCartItems(idUser: string) {
    try {
      const userCart = await this.create(idUser)
      const idCart = userCart.idCart

      const cartItems: ShoppingCartDetails[] = await this.shoppingCartDetails.findMany({
        where: { shoppingCartIdCart: idCart },
        include: {
          ProductCatalog: {
            select: {
              idProduct: true,
              productName: true,
              productImage: true
            }
          }
        }
      })

      return cartItems.map((item) => {
        const { productCatalogIdProduct, ...rest } = item
        return {
          ...rest
        }
      })
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async updateCartItem(updateCartItemDto: UpdateCartItemDto) {
    const { idUser, idProduct, quantity } = updateCartItemDto

    try {
      // 1.- get user cart
      const cart = await this.create(idUser)
      const idCart: number = cart.idCart

      // 2.- get Cart Item
      const cartItem = await this.shoppingCartDetails.findFirst({
        where: {
          shoppingCartIdCart: cart.idCart,
          productCatalogIdProduct: idProduct
        }
      })

      if (!cartItem) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `can not update quantity, Item was not found`
        })
      }

      if (quantity === 0) {
        // we delete cart detail
        return this.removeItem(cartItem.idShoppingCartDetails)
      }

      const shoppingCartDetail = await this.shoppingCartDetails.update({
        where: {
          idShoppingCartDetails: cartItem.idShoppingCartDetails
        },
        data: {
          quantity
        }
      })

      return shoppingCartDetail;
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async removeItem(idCartDetail: number) {
    try {
      const shoppingCartDetail = await this.shoppingCartDetails.findFirst({
        where: {
          idShoppingCartDetails: idCartDetail
        }
      })

      if (!shoppingCartDetail) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `Cart Item with id ${idCartDetail} not found`
        })
      }

      return await this.shoppingCartDetails.delete({
        where: {
          idShoppingCartDetails: idCartDetail
        }
      })
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }
}
