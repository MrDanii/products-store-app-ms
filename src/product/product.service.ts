import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { CreateCategoryDto, CreateProductDto, FindCategoryDto, ProductRatingDto, UpdateCategoryDto, UpdateProductDto } from './dto';
import { PrismaClient, ProductCategory, ProductRating } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { UserJwtDto } from 'src/common/dto/user-jwt.dto';
import { PaginationDto, TermDto } from 'src/common';

@Injectable()
export class ProductService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('Product')

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Product service and database connected')
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      const { categoryName } = createCategoryDto
      const category = await this.productCategory.findFirst({
        where: {
          categoryName: categoryName,
        }
      })

      if (category) {
        throw new RpcException({
          status: 400,
          message: `Category with name ${categoryName} already exists`
        })
      }

      const newCategory = await this.productCategory.create({
        data: createCategoryDto
      })

      return {
        productCategory: newCategory
      }
    } catch (error) {

      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async findAllCategories(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto
    try {
      const totalCategories = await this.productCategory.count({})
      const lastPage = Math.ceil(totalCategories / limit)

      const categories = await this.productCategory.findMany({
        take: limit,
        skip: ((page - 1) * limit)
      })

      return {
        data: categories,
        meta: {
          page: page,
          total: totalCategories,
          lastPage: lastPage
        }
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong check server logs'
      })
    }
  }

  async findCategory(termDto: TermDto) {
    const { term } = termDto
    let category: ProductCategory

    try {
      if (!isNaN(+term)) {
        //* This is a number, then we find by ID
        category = await this.productCategory.findFirst({
          where: { idCategory: +term }
        })
      } else {
        //* Its a string so we find by "categoryName"
        category = await this.productCategory.findFirst({
          where: {
            categoryName: term
          }
        })
      }

      if (!category) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `category not found by term: ${term}`
        })
      }

      return category
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }


  }

  async updateCategory(idCategory: number, updateCategory: UpdateCategoryDto) {
    try {
      const category = await this.productCategory.findFirst({
        where: {
          idCategory
        }
      })

      if (!category) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Can not update, category does not exists'
        })
      }

      const newCategory = await this.productCategory.update({
        data: updateCategory,
        where: { idCategory }
      })

      return {
        productCategory: newCategory
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async toggleActiveCategory(idCategory: number) {
    try {
      const category = await this.productCategory.findFirst({
        where: { idCategory }
      })

      if (!category) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `Category with id: ${idCategory} does not exists`
        })
      }

      const categoryUpdate = await this.productCategory.update({
        data: {
          isActive: !category.isActive
        },
        where: {
          idCategory: idCategory
        }
      })

      return categoryUpdate
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async removeCategory(idCategory: number) {
    try {
      // search if category has associated products
      const product = await this.productCatalog.findFirst({
        where: { productCategoryIdCategory: idCategory }
      })

      if (product) {
        //! We can not delete categories with products associated
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `Can not delete category with id: ${idCategory} (products already associated to that category)`
        })
      }

      await this.productCategory.delete({
        where: { idCategory }
      })

      return {
        status: HttpStatus.OK,
        message: `category with id ${idCategory} deleted successfully`
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async createProduct(createProductDto: CreateProductDto) {
    const {
      idCategory, productName, description,
      available, stockQuantity, price,
      tags, slug, createdBy
    } = createProductDto
    try {
      const product = await this.productCatalog.findUnique({
        where: {
          slug
        }
      })

      if (product) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `product with slug: "${slug}" already exists`
        })
      }

      const newProduct = await this.productCatalog.create({
        data: {
          productCategoryIdCategory: idCategory,
          productName,
          description,
          available,
          stockQuantity,
          price,
          tags,
          slug,
          createdBy
        }
      })

      return {
        productCatalog: newProduct
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async findAllProducts(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto

    try {
      const totalProducts = await this.productCatalog.count()
      const lastPage = Math.ceil(totalProducts / limit)

      const products = await this.productCatalog.findMany({
        take: limit,
        skip: (page - 1) * limit
      })

      return {
        data: products,
        meta: {
          page,
          total: totalProducts,
          lastPage: lastPage,
        }
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async findOneProduct(idProduct: string) {
    try {
      const product = await this.productCatalog.findFirst({
        where: { idProduct },
        include: {
          productImage: {
            select: {
              url: true
            }
          }
        }
      })

      if (!product) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `Product with id: ${idProduct} not found`
        })
      }

      return product
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  async update(idProduct: string, updateProductDto: UpdateProductDto) {
    const {
      productName, description, available, stockQuantity,
      price, tags, slug, createdBy
    } = updateProductDto

    try {
      const product = await this.productCatalog.findFirst({
        where: { idProduct },
        include: {
          productImage: {
            select: {
              idProductImage: true,
              url: true
            }
          }
        }
      })

      if (!product) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `Product with id: ${idProduct} does not exists`
        })
      }

      let productImage: string[]
      if (updateProductDto.productImage) {
        // removing duplicates
        productImage = [... new Set(updateProductDto.productImage)]
      } else {
        // if images were not provided on request, we preserve old images in DB (if there are any)
        productImage = (await this.productImage.findMany({ where: { productCatalogIdProduct: idProduct } })).map((currentImage) => (currentImage.url))
      }

      await this.productImage.deleteMany({
        where: { productCatalogIdProduct: idProduct }
      })

      const productUpdated = await this.productCatalog.update({
        data: {
          productName, description, available, stockQuantity,
          price, tags, slug, createdBy,
          productImage: {
            createMany: {
              data: productImage.map((currentImage) => {
                return {
                  url: currentImage
                }
              }),
              skipDuplicates: true
            },
          }
        },
        include: {
          productImage: {
            select: {
              productCatalogIdProduct: true,
              url: true
            }
          }
        },
        where: { idProduct }
      })

      return productUpdated

    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  // deactivateProduct(id: number) {
  //   return `This action removes a #${id} product`;
  // }

  async rateProduct(productRatingDto: ProductRatingDto) {
    // return {productRatingDto}
    const { idProduct, rating, createdBy } = productRatingDto

    try {
      const product = await this.productCatalog.findFirst({ where: { idProduct } })
      if (!product) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `Can not rate, product with id [${idProduct}] It does not exists`
        })
      }

      // verify if user already rated product
      const ratingExists = await this.productRating.findFirst({
        where: {
          AND: [
            { productCatalogIdProduct: idProduct },
            { createdBy: createdBy }
          ]
        }
      })

      if (!ratingExists) {
        // Product Rating does not exists, create rating
        return await this.productRating.create({
          data: {
            rating,
            productCatalogIdProduct: idProduct,
            createdBy
          }
        })
      } else {
        // Product Rating already exists, update rating
        return this.updateRatedProduct(rating, ratingExists.idProductRating, createdBy)
      }

    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  private async updateRatedProduct(rating: number, idProductRating: number, updatedBy: string) {
    // console.log({productRating});
    try {
      return await this.productRating.update({
        data: {
          rating: rating,
          updatedBy: updatedBy
        },
        where: {
          idProductRating: idProductRating
        }
      })
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }
}
