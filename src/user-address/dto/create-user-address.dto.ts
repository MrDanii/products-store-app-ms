import { IsOptional, IsString, IsUUID, MinLength } from "class-validator"

export class CreateUserAddressDto {
  @IsString()
  @MinLength(1)
  streetName: string

  @IsString()
  @MinLength(1)
  exteriorNumber: string

  @IsString()
  @MinLength(1)
  @IsOptional()
  interiorNumber?: string

  @IsString()
  @MinLength(1)
  @IsOptional()
  neighborhood?: string

  @IsString()
  @MinLength(1)
  city: string

  @IsString()
  @MinLength(1)
  state: string

  @IsString()
  @MinLength(1)
  country: string

  @IsString()
  @MinLength(1)
  zipCode: string

  @IsUUID()
  idUser: string
}
