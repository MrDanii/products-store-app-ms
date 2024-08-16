import { PartialType } from "@nestjs/mapped-types";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/common";

export class UserAddressesPaginatioDto extends PartialType(PaginationDto) {
  @IsString()
  @IsOptional()
  idUser?: string
}