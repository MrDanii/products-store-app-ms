import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PrismaClient, User } from '@prisma/client';
import { catchError, firstValueFrom } from 'rxjs';
import { SEED_USERS } from './data/seed-data';
import { ValidRoles } from 'src/auth/interfaces';
import { UpdateUserAdminDto, UpdateUserDto } from '../user-edit/dto';
import { UserEditModule } from '../user-edit/user-edit.module';
import { UserEditService } from 'src/user-edit/user-edit.service';
import { AuthService } from 'src/auth/auth.service';
import { ProductService } from 'src/product/product.service';
import { newTransport } from 'nats/lib/nats-base-client/transport';
import { UserAddressService } from 'src/user-address/user-address.service';
import { OrdersService } from 'src/orders/orders.service';

@Injectable()
export class SeedService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('seed')

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    private readonly authService: AuthService,
    private readonly userEditService: UserEditService,
    private readonly productService: ProductService,
    private readonly userAddressService: UserAddressService,
    private readonly ordersService: OrdersService,
  ) {
    super()
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Seed Service and database connected')
  }

  async executeSeed() {
    const isProdEnv = false // TODO: this variable should come from .env file

    try {
      if (isProdEnv) {
        throw new RpcException({
          status: HttpStatus.FORBIDDEN,
          message: `Action not permitted in current environment`
        })
      }
      await this.cleanTables()
      await this.populateTables()

      return {
        ok: true,
        status: HttpStatus.OK,
        message: "Seed was executed succesfully!!"
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.messsage
      })
    }
  }

  private async cleanTables() {
    // 1. UserAddress
    await this.userAddress.deleteMany()

    // 2. favoriteProducts
    await this.favoriteProducts.deleteMany()

    // 3. shoppingCartDetails
    await this.shoppingCartDetails.deleteMany()

    // 4. orderAddress 
    await this.orderAddress.deleteMany()

    // 5. orderDetails
    await this.orderDetails.deleteMany()

    // 6. orderReceipt
    await this.orderReceipt.deleteMany()

    // 7. productRating
    await this.productRating.deleteMany()

    // 8. productImage 
    await this.productImage.deleteMany()

    // 9. shoppingCart 
    await this.shoppingCart.deleteMany()

    // 10. order
    await this.order.deleteMany()

    // 11. productCatalog
    await this.productCatalog.deleteMany()

    // 12. productCategory
    await this.productCategory.deleteMany()

    // 13. user
    await this.user.deleteMany()
  }

  private async populateTables() {
    try {
      //* 1. user
      const newUsers: UpdatedUsersRestInterface[] = await this.createUsers()

      //* 2. Categories
      const newCategories = await this.createCategories(newUsers)

      //* 3. Products
      const newProducts = await this.createProducts(newUsers, newCategories)

      //* 4. User Address
      const userAddress: UserAddressInterface = await this.createAddress(newUsers[0])

      //* 5. Creating Order
      const newOrder = await this.createNewOrder(newUsers[0], userAddress, newProducts)

    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'help me! -- ' + error.messsage
      })
    }
  }

  private async createUsers(): Promise<UpdatedUsersRestInterface[]> {
    let usersRes = []

    try {
      for (const seedUser of SEED_USERS) {
        const newUser = await this.authService.createUser(seedUser)
        usersRes.push(newUser.user)
      }
      // modifying users roles
      let updateUserAdminDto: UpdateUserAdminDto
      let updatedUsers = []

      updateUserAdminDto = { idUser2: usersRes[0].idUser, roles: ['user', 'admin', 'superuser'], updatedBy: 'SYSTEM' }
      updatedUsers.push({ ...(await this.userEditService.updateUserFromAdmin(updateUserAdminDto)).updatedUser })
      updateUserAdminDto = { idUser2: usersRes[1].idUser, roles: ['user', 'admin'], updatedBy: 'SYSTEM' }
      updatedUsers.push({ ...(await this.userEditService.updateUserFromAdmin(updateUserAdminDto)).updatedUser })
      updateUserAdminDto = { idUser2: usersRes[2].idUser, roles: ['user',], updatedBy: 'SYSTEM' }
      updatedUsers.push(({ ...(await this.userEditService.updateUserFromAdmin(updateUserAdminDto)).updatedUser }))

      return updatedUsers
    } catch (error) {
      throw new RpcException(error)
    }
  }

  private async createCategories(users: UpdatedUsersRestInterface[]) {

    try {
      const promisesArray = [
        { ...(await this.productService.createCategory({ createdBy: users[0].userNickName, categoryName: 'Computers' })).productCategory },
        { ...(await this.productService.createCategory({ createdBy: users[0].userNickName, categoryName: 'Audio' })).productCategory },
        { ...(await this.productService.createCategory({ createdBy: users[0].userNickName, categoryName: 'Monitors' })).productCategory },
        { ...(await this.productService.createCategory({ createdBy: users[1].userNickName, categoryName: 'Food' })).productCategory },
        { ...(await this.productService.createCategory({ createdBy: users[1].userNickName, categoryName: 'Drinks' })).productCategory },
        { ...(await this.productService.createCategory({ createdBy: users[2].userNickName, categoryName: 'Desserts' })).productCategory },
      ]

      const newCategories = await Promise.all(promisesArray)
      return newCategories
    } catch (error) {
      throw new RpcException(error)
    }
  }

  private async createProducts(users: UpdatedUsersRestInterface[], categories: any[]) {
    try {
      const promisesArray = [
        {
          ...(await this.productService.createProduct({
            createdBy: users[0].userNickName,
            idCategory: categories.find((value) => value.categoryName === "Computers").idCategory,
            price: 580.50, productName: "Red Laptop", slug: "red_laptop",
            productImage: ["https://res.cloudinary.com/dbrepifea/image/upload/v1727122122/no_image_xwnllm.jpg"]
          })).productCatalog
        },
        {
          ...(await this.productService.createProduct({
            createdBy: users[0].userNickName,
            idCategory: categories.find((value) => value.categoryName === "Computers").idCategory,
            price: 850.50, productName: "Black Laptop", slug: "black_laptop",
            productImage: ["https://res.cloudinary.com/dbrepifea/image/upload/v1727122122/no_image_xwnllm.jpg"]
          })).productCatalog
        },
        {
          ...(await this.productService.createProduct({
            createdBy: users[0].userNickName,
            idCategory: categories.find((value) => value.categoryName === "Audio").idCategory,
            price: 120.33, productName: "XL Headphones", slug: "xl_headphones",
            productImage: ["https://res.cloudinary.com/dbrepifea/image/upload/v1727122122/no_image_xwnllm.jpg"]
          })).productCatalog
        },
        {
          ...(await this.productService.createProduct({
            createdBy: users[0].userNickName,
            idCategory: categories.find((value) => value.categoryName === "Monitors").idCategory,
            price: 200.80, productName: "20 Inches Black Monitor", slug: "20_inches_black_monitor",
            productImage: ["https://res.cloudinary.com/dbrepifea/image/upload/v1727122122/no_image_xwnllm.jpg"]
          })).productCatalog
        },
        {
          ...(await this.productService.createProduct({
            createdBy: users[0].userNickName,
            idCategory: categories.find((value) => value.categoryName === "Food").idCategory,
            price: 80.00, productName: "Pizza", slug: "pizza",
            productImage: ["https://res.cloudinary.com/dbrepifea/image/upload/v1727122122/no_image_xwnllm.jpg"]
          })).productCatalog
        },
        {
          ...(await this.productService.createProduct({
            createdBy: users[0].userNickName,
            idCategory: categories.find((value) => value.categoryName === "Food").idCategory,
            price: 60.00, productName: "Meat", slug: "meat",
            productImage: ["https://res.cloudinary.com/dbrepifea/image/upload/v1727122122/no_image_xwnllm.jpg"]
          })).productCatalog
        },
        {
          ...(await this.productService.createProduct({
            createdBy: users[0].userNickName,
            idCategory: categories.find((value) => value.categoryName === "Food").idCategory,
            price: 15.00, productName: "Bread", slug: "bread",
            productImage: ["https://res.cloudinary.com/dbrepifea/image/upload/v1727122122/no_image_xwnllm.jpg"]
          })).productCatalog
        },
        {
          ...(await this.productService.createProduct({
            createdBy: users[0].userNickName,
            idCategory: categories.find((value) => value.categoryName === "Drinks").idCategory,
            price: 10.00, productName: "Coffee", slug: "coffee",
            productImage: ["https://res.cloudinary.com/dbrepifea/image/upload/v1727122122/no_image_xwnllm.jpg"]
          })).productCatalog
        },
      ]

      const newProducts = await Promise.all(promisesArray)
      return newProducts
    } catch (error) {
      throw new RpcException(error)
    }
  }

  private async createAddress(user: UpdatedUsersRestInterface) {
    try {
      const newAddress = await this.userAddressService.create({
        idUser: user.idUser, exteriorNumber: "129", streetName: "Montes Cervino", neighborhood: "Cordillera",
        city: "Leon", state: "Gto", country: "Mex", zipCode: "37000",
      })

      return newAddress
    } catch (error) {
      throw new RpcException(error)
    }
  }

  private async createNewOrder(user: UpdatedUsersRestInterface, userAddress: UserAddressInterface, productsCatalog) {
    try {
      const newOrder = await this.ordersService.create({
        createdBy: user.idUser,
        idUserAddress: userAddress.idUserAddress,
        items: [
          { idProduct: productsCatalog[0].idProduct, price: productsCatalog[0].price, quantity: 3 },
          { idProduct: productsCatalog[1].idProduct, price: productsCatalog[1].price, quantity: 1 },
          { idProduct: productsCatalog[2].idProduct, price: productsCatalog[2].price, quantity: 2 },
          { idProduct: productsCatalog[3].idProduct, price: productsCatalog[3].price, quantity: 1 },
          { idProduct: productsCatalog[4].idProduct, price: productsCatalog[4].price, quantity: 8 },
        ]
      })
  
      return newOrder
    } catch (error) {
      throw new RpcException(error)
    }
  }
}

interface UpdatedUsersRestInterface {
  idUser: string;
  email: string;
  isGoogleUser: boolean;
  userNickName: string;
  fullName: string;
  isActive: boolean;
  roles: string[];
  lastLogin: Date | null;
  createdBy: string;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UserAddressInterface {
  idUserAddress: string;
  streetName: string;
  exteriorNumber: string;
  interiorNumber: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  userIdUser: string | null;
}