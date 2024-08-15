import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { UserJwtDto } from 'src/common';
import { AddCartDetailDto } from './dto';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @MessagePattern('cart.create')
  create(@Payload() idUser: string) {
    return this.cartService.create(idUser);
  }

  @MessagePattern('cart.add.item.one')
  addItem(@Payload() addCartDetailDto: AddCartDetailDto) {
    return this.cartService.addCartDetail(addCartDetailDto);
  }

  @MessagePattern('cart.find.all')
  findAll(@Payload() idUser: string) {
    return this.cartService.findAllCartItems(idUser);
  }

  // @MessagePattern('cart.find.one')
  // findOne(@Payload() id: number) {
  //   return this.cartService.findOne(id);
  // }

  @MessagePattern('cart.update.item')
  update(@Payload() updateCartDto: UpdateCartItemDto) {
    return this.cartService.updateCartItem(updateCartDto);
  }

  @MessagePattern('cart.remove.item')
  remove(@Payload() idCartDetail: number) {
    return this.cartService.removeItem(idCartDetail);
  }
}
