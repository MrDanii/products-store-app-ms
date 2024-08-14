import { IsInt, IsNumber, IsPositive, IsUUID } from "class-validator"

export class OrderDetailsDto {
  @IsUUID()
  idProduct: string

  @IsInt()
  @IsPositive()
  quantity: number
  
  @IsNumber()
  @IsPositive()
  price: number
}