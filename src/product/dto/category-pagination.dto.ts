import { IsString, MinLength } from "class-validator";
import { PaginationDto } from "src/common";

export class FindCategoryDto {
  @IsString()
  @MinLength(1)
  term: string
}