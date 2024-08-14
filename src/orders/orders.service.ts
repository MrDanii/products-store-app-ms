import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient, ProductCatalog } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';
import { ChangeStatusDto, OrderPaginationDto } from './dto';
import { arrayNotEmpty } from 'class-validator';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('Orders')

  constructor(
    @Inject(NATS_SERVICE) private readonly natsClient: ClientProxy
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Orders service and database connected')
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      // 1.- verify that all products exists
      const productIds = createOrderDto.items.map((item) => (item.idProduct))
      const verifiedProducts: ProductCatalog[] = await firstValueFrom(
        this.natsClient.send('products.validate', productIds)
      )

      // 2.- Calculate total
      const totalAmount: number = createOrderDto.items.reduce((acc, orderItem) => {
        const price: number = verifiedProducts.find(
          (product) => (product.idProduct === orderItem.idProduct)
        ).price

        return acc + (price * orderItem.quantity)
      }, 0)

      const totalItems: number = createOrderDto.items.reduce((acc, orderItem) => {
        return (acc + orderItem.quantity)
      }, 0)

      // 3.- Create Order Transaction
      const order = await this.order.create({
        data: {
          createdBy: createOrderDto.createdBy,
          totalAmount,
          totalItems,
          orderDetails: {
            createMany: {
              data: createOrderDto.items.map((item) => {
                return {
                  productCatalogIdProduct: item.idProduct,
                  quantity: item.quantity,
                  price: verifiedProducts.find(
                    (product) => (product.idProduct === item.idProduct)
                  ).price
                }
              })
            }
          }
        },
        include: {
          orderDetails: {
            select: {
              productCatalogIdProduct: true,
              quantity: true,
              price: true
            }
          }
        }
      })

      return {
        ...order,
        orderDetails: order.orderDetails.map((item) => ({
          ...item,
          name: verifiedProducts.find(
            (product) => product.idProduct === item.productCatalogIdProduct
          ).productName
        }))
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }

  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const { limit, page, orderStatus } = orderPaginationDto

    try {
      const totalOrders: number = await this.order.count({
        where: {
          orderStatus: orderStatus
        }
      })
      const lastPage = Math.ceil(totalOrders / limit)

      const orders = await this.order.findMany({
        where: {
          orderStatus: orderStatus
        },
        take: limit,
        skip: ((page - 1) * limit)
      })

      return {
        data: { orders },
        meta: {
          page: page,
          total: totalOrders,
          lastPage: lastPage
        }
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async findOne(id: string) {
    try {
      const order = await this.order.findFirst({
        where: { idOrder: id },
        include: {
          orderDetails: {
            select: {
              productCatalogIdProduct: true,
              quantity: true,
              price: true
            }
          }
        }
      })

      if (!order) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `Order with id: [${id}] not found`
        })
      }

      const productsIds: string[] = order.orderDetails.map((item) => (item.productCatalogIdProduct))
      const verifiedProducts: ProductCatalog[] = await firstValueFrom(this.natsClient.send('products.validate', productsIds))

      return {
        ...order,
        orderDetails: order.orderDetails.map((item) => ({
          ...item,
          name: verifiedProducts.find((product) => (product.idProduct === item.productCatalogIdProduct)).productName
        }))
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async changeStatus(changeStatusDto: ChangeStatusDto) {
    const { idOrder, orderStatus } = changeStatusDto
    const order = await this.order.findFirst({
      where: { idOrder }
    })

    // avoid request if status are the same
    if (order.orderStatus === orderStatus) {
      return order
    }

    return await this.order.update({
      data: { orderStatus },
      where: { idOrder }
    })
  }

  paidOrder() {
    
  }
}
