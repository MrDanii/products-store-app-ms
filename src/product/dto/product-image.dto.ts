import { IsString, IsUrl } from "class-validator";

export class ProductImageDto {
  @IsString()
  idProduct: string

  // @IsUrl()
  url: string
  
}