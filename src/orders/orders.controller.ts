import { Controller, NotImplementedException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ChangeStatusDto, OrderPaginationDto, PaidOrderDto } from './dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('order.create')
  async create(@Payload() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto)
    const paymentSession = {some: "123"}
    // TODO: implement payment from microservice
    // const paymentSession = this.ordersService.createPaymentSession(order)

    return {
      order,
      paymentSession
    }
  }

  @MessagePattern('order.find.all')
  findAll(@Payload() orderPaginationDto: OrderPaginationDto) {
    return this.ordersService.findAll(orderPaginationDto);
  }

  @MessagePattern('order.find.one')
  findOne(@Payload() id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern('order.update.status')
  update(@Payload() changeStatusDto: ChangeStatusDto) {
    // return {changeStatusDto}
    return this.ordersService.changeStatus(changeStatusDto);
  }

  // TODO: create a service to mark order as 'PAID'
  @MessagePattern('order.paid')
  paidOrder(@Payload() paidOrderDto: PaidOrderDto) {
    return {paidOrderDto}
  }
}
