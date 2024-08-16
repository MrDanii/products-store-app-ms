import { PartialType } from '@nestjs/mapped-types';
import { CreateUserAddressDto } from './create-user-address.dto';
import { IsString } from 'class-validator';

export class UpdateUserAddressDto extends PartialType(CreateUserAddressDto) {
  @IsString()
  idUserAddress: string
}
