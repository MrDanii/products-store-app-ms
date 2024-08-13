import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength, ValidateNested } from "class-validator";

export class CreateProductDto {
  @IsNumber()
  @IsPositive()
  idCategory: number

  @IsString()
  @MinLength(1)
  productName: string

  @IsString()
  @IsOptional()
  description?: string

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  available?: boolean

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  stockQuantity?: number
  
  @IsNumber()
  @IsPositive()
  price: number

  @IsArray()
  @IsString({each: true})
  @IsOptional()
  tags?: string[]

  @IsString()
  slug: string

  @IsString()
  createdBy: string

  @IsArray()
  @IsString({each: true})
  @IsOptional()
  productImage?: string[]

}
