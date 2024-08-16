import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { CreateUserAddressDto, FindAddressDto, RemoveAddressDto, UpdateUserAddressDto, UserAddressesPaginatioDto } from './dto';

@Injectable()
export class UserAddressService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('User Address')

  async onModuleInit() {
    await this.$connect();
    this.logger.log('User Addresses and database connected')
  }

  async create(createUserAddressDto: CreateUserAddressDto) {
    const {
      idUser, streetName, exteriorNumber, interiorNumber,
      neighborhood, city, state, country, zipCode
    } = createUserAddressDto

    try {
      return await this.userAddress.create({
        data: {
          userIdUser: idUser, streetName, exteriorNumber, interiorNumber,
          neighborhood, city, state, country, zipCode
        }
      })
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async findAll(userAddressesPaginatioDto: UserAddressesPaginatioDto) {
    const { idUser, limit, page } = userAddressesPaginatioDto

    try {
      const totalAddresses = await this.userAddress.count({
        where: { userIdUser: idUser }
      })
      const totalPages = Math.ceil(totalAddresses / limit)

      const userAddresses = await this.userAddress.findMany({
        where: {
          userIdUser: idUser
        },
        skip: (page - 1) * limit,
        take: limit
      })

      if (!userAddresses || userAddresses.length === 0) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'No addresses found for this user'
        })
      }

      return {
        data: userAddresses,
        meta: {
          page,
          totalPages,
          total: totalAddresses
        }
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async findOne(findAddressDto: FindAddressDto) {
    const { idUser, idUserAddress } = findAddressDto

    try {
      const userAddress = await this.userAddress.findFirst({
        where: {
          idUserAddress,
          userIdUser: idUser
        }
      })

      console.log({ userAddress, what: '123' });

      if (!userAddress) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `Address with id [${idUserAddress}] not found`
        })
      }

      return userAddress
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async update(updateUserAddressDto: UpdateUserAddressDto) {
    const { idUserAddress, idUser, ...rest } = updateUserAddressDto
    try {
      const addressExists = await this.userAddress.findFirst({ where: { idUserAddress } })
      if (!addressExists) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `Can not update, address with id: [${idUserAddress}] does not exists`
        })
      }
      const updatedAddress = await this.userAddress.update({
        data: rest,
        where: { idUserAddress }
      })

      return updatedAddress
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async remove(removeAddressDto: RemoveAddressDto) {
    const { idUserAddress, userIdUser } = removeAddressDto
    try {
      const addressExists = await this.userAddress.findFirst({
        where: { idUserAddress, userIdUser }
      })

      if (!addressExists) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `Address with id [${idUserAddress}] was not found`
        })
      }

      const delAddress = await this.userAddress.delete({
        where: { idUserAddress, userIdUser }
      })

      return {
        status: HttpStatus.OK,
        messasge: `Address with id [${idUserAddress}] was deleted successfully`
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
    return removeAddressDto
  }
}
