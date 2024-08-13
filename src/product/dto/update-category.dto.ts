import { PartialType } from "@nestjs/mapped-types";
import { CreateCategoryDto } from "./create-category.dto";
import { IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsNumber()
  @IsPositive()
  idCategory: number

  @IsString()
  @IsOptional()
  @MinLength(1)
  updatedBy?: string
}