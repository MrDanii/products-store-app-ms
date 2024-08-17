import { IsUUID } from "class-validator"

export class ProductFavoriteDto {
  @IsUUID()
  idUser: string

  @IsUUID()
  productId: string // productId that will be added to the list of favorites
}
