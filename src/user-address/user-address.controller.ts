import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserAddressService } from './user-address.service';
import { CreateUserAddressDto, FindAddressDto, RemoveAddressDto, UpdateUserAddressDto, UserAddressesPaginatioDto } from './dto';

@Controller()
export class UserAddressController {
  constructor(private readonly userAddressService: UserAddressService) {}

  @MessagePattern('address.user.create')
  create(@Payload() createUserAddressDto: CreateUserAddressDto) {
    return this.userAddressService.create(createUserAddressDto);
  }

  @MessagePattern('address.user.find.many')
  findAll(@Payload() userAddressesPaginatioDto: UserAddressesPaginatioDto) {
    return this.userAddressService.findAll(userAddressesPaginatioDto);
  }

  @MessagePattern('address.user.find.one')
  findOne(@Payload() findAddressDto: FindAddressDto) {
    return this.userAddressService.findOne(findAddressDto);
  }

  @MessagePattern('address.update')
  update(@Payload() updateUserAddressDto: UpdateUserAddressDto) {
    return this.userAddressService.update(updateUserAddressDto);
  }

  @MessagePattern('address.remove.one')
  remove(@Payload() removeAddressDto: RemoveAddressDto) {
    return this.userAddressService.remove(removeAddressDto);
  }
}
