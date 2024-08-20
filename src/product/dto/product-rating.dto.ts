import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsString, IsUUID, Max, Min, MinLength } from "class-validator"

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
  @IsOptional()
  createdBy?: string

  @IsString()
  @MinLength(1)
  @IsOptional()
  updatedBy?: string
}