import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus, PrismaClient, ProductCatalog } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';
import { ChangeStatusDto, OrderPaginationDto, PaidOrderDto, PaymentSessionDto } from './dto';
import { arrayNotEmpty } from 'class-validator';
import { OrderWithItems } from './interfaces/order-with-items.interface';

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
      // 0.- Extra Step in case we need Address on Orders
      const userAddress = await this.userAddress.findUnique({
        where: { idUserAddress: createOrderDto.idUserAddress }
      })

      if (!userAddress) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `address with ID: [${createOrderDto.idUserAddress}] was not found`
        })
      }
      const { idUserAddress, userIdUser, ...restUserAddress } = userAddress // dropping things that we dont need for 'OrderAddress' Table

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
          },
          orderAddress: { create: restUserAddress }
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

  async createPaymentSession(order: OrderWithItems) {
    const paymentSessionDto: PaymentSessionDto = {
      orderId: order.idOrder,
      currency: 'mxn',
      items: order.orderDetails.map((currentItem) => {
        return {
          name: currentItem.name,
          price: currentItem.price,
          quantity: currentItem.quantity
        }
      })
    }

    const paymentSession = await firstValueFrom(this.natsClient.send('create.payment.session', paymentSessionDto))
    return paymentSession
  }

  async paidOrder(paidOrderDto: PaidOrderDto) {
    this.logger.log('Order Paid')
    this.logger.log(paidOrderDto)

    const { orderId, stripePaymentId, receiptUrl } = paidOrderDto
    try {
      const orderUpdated = await this.order.update({
        where: { idOrder: orderId },
        data: {
          orderStatus: OrderStatus.PAID,
          isPaid: true,
          paidAt: new Date(),
          stripeChargeId: stripePaymentId,

          orderReceipt: {
            create: {
              receiptUrl: receiptUrl
            }
          }
        }
      })

      return orderUpdated
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }
}
