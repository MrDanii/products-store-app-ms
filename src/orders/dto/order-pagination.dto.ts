import { OrderStatus } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";
import { OrderStatusList } from "../enum/order.enum";
import { PaginationDto } from "src/common";

export class OrderPaginationDto extends PaginationDto  {
  @IsOptional()
  @IsEnum(OrderStatusList, {
    message: `Valid Status are: ${OrderStatusList}`
  })
  orderStatus?: OrderStatus
}