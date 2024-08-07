import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcrypt'
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('Auth')

  constructor(
    private readonly jwtService: JwtService
  ) {
    super()
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Auth Service and Database connected')
  }

  async signJWT(payload: JwtPayload, jwtExpireTime = '2h') {
    return this.jwtService.sign(payload, { expiresIn: jwtExpireTime })
  }

  async createUser(createUserDto: CreateUserDto) {
    const { email, fullName, userNickName, password } = createUserDto

    try {
      const currentUser = await this.user.findUnique({
        where: {
          email
        }
      })

      if (currentUser) {
        throw new RpcException({
          status: 400,
          message: 'User already exists'
        })
      }

      const passwordHashed = bcrypt.hashSync(password, 10)

      const newUser = await this.user.create({
        data: {
          email: email,
          password: passwordHashed,
          fullName: fullName,
          userNickName: userNickName
        }
      })

      const { password: __, ...rest } = newUser
      const jwtPayload: JwtPayload = this.generateJwtPayload(newUser)
      return {
        user: rest,
        token: await this.signJWT(jwtPayload)
      };

    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message
      })
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto

    try {
      const currentUser = await this.user.findUnique({
        where: {
          email: email,
        }
      })

      if (!currentUser) {
        throw new RpcException({
          status: 400,
          message: 'user Email/password do not match'
        })
      }

      const isPasswordValid = bcrypt.compareSync(password, currentUser.password)

      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'user Email/Password do not match'
        })
      }

      const { password: __, ...rest } = currentUser
      const jwtPayload = this.generateJwtPayload(currentUser)

      return {
        user: rest,
        token: await this.signJWT(jwtPayload)
      }
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message
      })
    }
  }

  async verifyToken(token: string) {
    try {

      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret
      })
      // podemos enviar el mismo token o renovarlo
      return {
        user: user,
        token: await this.signJWT(user)
      }

    } catch (error) {
      // console.log(error)
      throw new RpcException({
        status: 401,
        message: 'Token not valid'
      })
    }
  }

  private generateJwtPayload(user: User): JwtPayload {
    const jwtPayload: JwtPayload = {
      id: user.idUser,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles
    }

    return jwtPayload
  }
}
