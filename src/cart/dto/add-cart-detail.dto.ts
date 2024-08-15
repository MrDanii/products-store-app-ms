import { IsArray, IsEmail, IsInt, IsNumber, IsPositive, IsString, IsUUID, Min, MinLength } from "class-validator";

export class AddCartDetailDto {

  @IsUUID()
  idProduct: string

  @IsInt()
  @IsPositive()
  quantity: number

  @IsNumber()
  @IsPositive()
  price:number

  @IsUUID()
  idUser: string
}