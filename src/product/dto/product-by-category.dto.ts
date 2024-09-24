import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, Min } from "class-validator";
import { PaginationDto } from "src/common";

export class ProductByCategoryDto extends PartialType(PaginationDto) {

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  idCategory: number

}