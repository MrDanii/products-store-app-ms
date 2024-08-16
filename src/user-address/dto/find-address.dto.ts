import { IsOptional, IsString, MinLength } from "class-validator"

export class FindAddressDto {
  @IsString()
  @IsOptional()
  idUser?: string

  @IsString()
  idUserAddress: string
}