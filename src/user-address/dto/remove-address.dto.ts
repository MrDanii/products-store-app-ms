import { IsString } from "class-validator"

export class RemoveAddressDto {
  @IsString()
  idUserAddress: string
  @IsString()
  userIdUser: string
}