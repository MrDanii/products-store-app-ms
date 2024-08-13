import { Type } from "class-transformer"
import { IsNumber, IsString, IsUUID, Max, Min, MinLength } from "class-validator"

export class ProductRatingDto {
  @IsUUID()
  idProduct: string

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(10)
  rating: number

  @IsString()
  @MinLength(1)
  createdBy: string
}