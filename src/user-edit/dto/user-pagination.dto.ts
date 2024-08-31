import { IsOptional, IsString, MinLength } from "class-validator";
import { PaginationDto } from "src/common";

export class UserPaginationDto extends PaginationDto{
  @IsOptional()
  @IsString()
  @MinLength(1)
  role: string = 'user'
}