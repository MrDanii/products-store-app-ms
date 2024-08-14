import { OrderStatus } from "@prisma/client"
import { IsEnum, IsUUID, ValidateNested } from "class-validator"
import { OrderStatusList } from "../enum/order.enum"
import { Type } from "class-transformer"

export class ChangeStatusDto {
  @IsUUID()
  idOrder: string

  @IsEnum(OrderStatusList, {
    message: `Correct Status are: [${OrderStatusList}]`
  })
  orderStatus: OrderStatus
}