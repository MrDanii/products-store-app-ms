import { Type } from "class-transformer";
import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  categoryName: string

  @IsBoolean()
  // @Type(() => Boolean)
  @IsOptional()
  isActive?: boolean
  
  @IsString()
  @IsOptional()
  createdBy?: string
}