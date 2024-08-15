import { IsInt,IsUUID, Min } from 'class-validator';

export class UpdateCartItemDto {
  @IsUUID()
  idUser: string

  @IsUUID()
  idProduct: string

  @IsInt()
  @Min(0)
  quantity: number
}
