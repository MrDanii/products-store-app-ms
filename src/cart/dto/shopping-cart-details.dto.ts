import { IsInt, IsNumber, IsPositive, IsString, IsUUID } from "class-validator"

export class ShoppingCartDetailsDto {
  @IsUUID()
  idProduct: string

  @IsInt()
  @IsPositive()
  quantity: number

  @IsNumber()
  @IsPositive()
  price:number
}