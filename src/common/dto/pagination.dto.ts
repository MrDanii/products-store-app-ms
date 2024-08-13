import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator"

export class PaginationDto {

  @IsPositive()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1
  
  @IsPositive()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10
}