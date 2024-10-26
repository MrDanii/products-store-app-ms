import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ToggleActiveUserDto, UpdateUserAdminDto, UpdateUserDto, UserPaginationDto } from './dto';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from "bcrypt";
import { MessagePattern, RpcException } from '@nestjs/microservices';

@Injectable()
export class UserEditService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('User-Edit')

  onModuleInit() {
    this.$connect()
    this.logger.log('User-Edit Service and Database connected')
  }

  async findAllUsers(userPaginationDto: UserPaginationDto) {
    const { role, limit, page } = userPaginationDto

    try {
      const totalUsers = await this.user.count({
        where: { roles: { has: role } }
      })
      const lastPage = Math.ceil(totalUsers / limit)

      const users = await this.user.findMany({
        select: {
          idUser: true,
          email: true,
          userNickName: true,
          fullName: true,
          isActive: true,
          lastLogin: true,
          roles: true
        },
        where: {
          roles: { has: role }
        },
        take: limit,
        skip: ((page - 1) * limit)
      })

      return {
        data: users,
        meta: {
          page,
          lastPage,
          total: totalUsers,
        }
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async findUser(idUser: string) {
    try {
      const currentUser = await this.user.findUnique({
        where: { idUser: idUser }
      })

      if (!currentUser) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `User wiht id: [${idUser} not found]`
        })
      }

      const { password, ...restUser } = currentUser

      return {
        user: restUser
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async updateSelfUserInfo(updateUserDto: UpdateUserDto) {
    const { idUser, ...rest } = updateUserDto

    try {
      const currentUser = await this.user.findUnique({
        where: { idUser }
      })

      if (!currentUser) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `Can't update user with ID: [${idUser}] It does not exists`
        })
      }

      const updatedUser = await this.user.update({
        data: { ...rest },
        where: { idUser: idUser }
      })

      const { password, ...updatedRest } = updatedUser  // avoid sending password

      return {
        updatedUser: updatedRest
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async updateUserFromAdmin(updateUserAdminDto: UpdateUserAdminDto) {
    const { idUser2: idUser, password, useWhoUpdated, ...rest } = updateUserAdminDto


    try {
      const currentUser = await this.user.findUnique({
        where: { idUser }
      })

      if (!currentUser) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `Can't update user with ID: [${idUser}] It does not exists`
        })
      }

      // hash Password
      if (password) rest['password'] = bcrypt.hashSync(password, 10)
      // console.log({ rest });

      const updatedUser = await this.user.update({
        data: { ...rest, updatedBy: useWhoUpdated },
        where: { idUser: idUser }
      })

      const { password: passwordUpdated, ...updatedRest } = updatedUser  // avoid sending password

      return {
        updatedUser: updatedRest
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async toggleActiveUser(toggleActiveUserDto: ToggleActiveUserDto) {
    const { idUserToToggle: idUser, userWhoUpdated } = toggleActiveUserDto
    try {
      const currentUser = await this.user.findUnique({
        where: { idUser }
      })

      if (!currentUser) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `Failed to activate or deactivate, user with id [${idUser}] doesn't exists`
        })
      }

      const updatedUser = await this.user.update({
        data: {
          isActive: !(currentUser.isActive),
          updatedBy: userWhoUpdated
        },
        where: { idUser }
      })

      const { password, ...rest } = updatedUser

      return {
        updatedUser: rest
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }
}
