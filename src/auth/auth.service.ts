import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateUserDto, GoogleAuthDto, LoginUserDto } from './dto';
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
      userNickName: user.userNickName,
      fullName: user.fullName,
      roles: user.roles
    }

    return jwtPayload
  }

  // Google Login creates an account or log into an account if it already exists
  async googleLoginUser(googleAuthDto: GoogleAuthDto) {
    const { email, firstName, lastName } = googleAuthDto

    try {
      const currentUser = await this.user.findUnique({
        where: {
          email
        }
      })

      if (!currentUser) {
        // If user does not exists we create a new user
        const newUser = await this.user.create({
          data: {
            email: email,
            userNickName: this.generateRandomUserNickName(firstName, lastName),
            isGoogleUser: true,
            fullName: firstName
          }
        })

        const { password: __, ...rest } = newUser
        const jwtPayload: JwtPayload = this.generateJwtPayload(newUser)

        return {
          user: rest,
          token: await this.signJWT(jwtPayload)
        };

      } else {
        // If already exists we log as normal, and we update user registry in googleUser flag in database
        const userUpdated = await this.user.update({
          data: {
            isGoogleUser: true,
            lastLogin: new Date()
          },
          where: {
            idUser: currentUser.idUser
          }
        })

        const { password: ___, ...rest } = userUpdated
        const jwtPayload: JwtPayload = this.generateJwtPayload(userUpdated)

        return {
          user: rest,
          token: await this.signJWT(jwtPayload)
        }

      }
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message
      })
    }
  }

  // this method generates a random nickName for google users
  private generateRandomUserNickName(firstName: string, lastName: string) {
    // ascii code group 1: 30 - 39 (numbers) (10 characters)
    // ascii code group 2: 65 - 90 (uppercase letter) (26 characters)
    // ascii code group 3: 97 - 122 (lowercase letters) (26 characters)
    const asciiGroup: number = Math.floor((Math.random() * 3))  // 3 groups to choose
    let qtyCharacters: number // the number of characters available to each group
    let rangeOb: { start: number, end: number } // start: means where start in ascii 

    switch (asciiGroup) {
      case 0:
        rangeOb = { start: 30, end: 39 }
        qtyCharacters = 10
        break;
      case 1:
        rangeOb = { start: 65, end: 90 }
        qtyCharacters = 26
        break;
      case 2:
        rangeOb = { start: 97, end: 122 }
        qtyCharacters = 26
    }

    let randomString: string = ''
    let currentCharCode: number

    for (let i = 0; i < 4; i++) {
      currentCharCode = rangeOb.start + (Math.floor(Math.random() * qtyCharacters))
      randomString += '' + String.fromCharCode(currentCharCode)
    }
    // console.log(`Random String: ${randomString}`);

    const randomNickName = firstName.substring(0, 4) + lastName.substring(0, 3) + randomString
    return randomNickName
  }
}
