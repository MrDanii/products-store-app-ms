import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { CreateCategoryDto, CreateProductDto, FindCategoryDto, ProductByCategoryDto, ProductRatingDto, UpdateCategoryDto, UpdateProductDto } from './dto';
import { PrismaClient, ProductCategory, ProductRating } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { UserJwtDto } from 'src/common/dto/user-jwt.dto';
import { PaginationDto, TermDto } from 'src/common';
import { sourceMapsEnabled } from 'process';

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
        skip: ((page - 1) * limit),
        where: {
          isActive: true
        }
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
      tags, slug, createdBy, productImage
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


      if (productImage) {
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
            createdBy,
            productImage: {
              createMany: {
                data: productImage?.map((prodImage) => {
                  return {
                    url: prodImage
                  }
                })
              }
            }
          },
          include: {
            productImage: {
              select: {
                idProductImage: true,
                url: true
              }
            }
          }
        })

        return {
          productCatalog: newProduct
        }
      } else {
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
          },
          include: {
            productImage: {
              select: {
                idProductImage: true,
                url: true
              }
            }
          }
        })

        return {
          productCatalog: newProduct
        }
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
        skip: (page - 1) * limit,
        include: {
          ProductCategory: {
            select: {
              idCategory: true,
              categoryName: true
            }
          },
          productImage: {
            select: {
              idProductImage: true,
              url: true
            }
          }
        }
      })

      const newProducts = products.map((prod) => {
        const {productCategoryIdCategory, ...rest} = prod
        return rest
      })

      return {
        data: newProducts,
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
      price, tags, slug, createdBy, updatedBy
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
          price, tags, slug, createdBy, updatedBy,
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
    const { idProduct, rating, createdBy, updatedBy } = productRatingDto

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
        return this.updateRatedProduct(rating, ratingExists.idProductRating, updatedBy)
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

  // Method that validates if all products exists
  async validateProducts(productsIds: string[]) {
    productsIds = [...new Set(productsIds)]

    const products = await this.productCatalog.findMany({
      where: {
        idProduct: {
          in: productsIds
        }
      }
    })

    if (productsIds.length !== products.length) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Some products were not found'
      })
    }

    return products
  }

  async findProductsByCategory(productByCategoryDto: ProductByCategoryDto) {
    const { idCategory, limit, page } = productByCategoryDto

    try {
      const totalProducts = await this.productCatalog.count({ where: { productCategoryIdCategory: idCategory } })
      const lastPage = Math.ceil(totalProducts / limit)
      const products = await this.productCatalog.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          productCategoryIdCategory: idCategory
        },
        include: {
          productRating: {
            select: {
              rating: true,
              createdBy: true
            }
          },
          productImage: {
            select: {
              url: true
            }
          }
        }
      })

      if (!products || products.length === 0) {
        throw new RpcException({
          status: 400,
          message: `Product with category Id ${idCategory} were not found`
        })
      }

      const newProducts = products.map((currentProduct) => {
        return {
          ...currentProduct,
          ratingAvg: (currentProduct.productRating.reduce((acc, currentRating) => {
            return acc + (currentRating.rating)
          }, 0)) / (currentProduct.productRating.length),
          totalLikes: 0
        }
      })

      // 1. Define Products
      const productsIds = newProducts.map((currentProd) => {
        return currentProd.idProduct
      })

      // 2. Get from favoriteProducts table related to all definedProducts
      const favoriteProducts = await this.favoriteProducts.findMany({
        where: {
          productsList: {
            hasSome: productsIds
          }
        },
        select: {
          productsList: true
        }
      })

      // 3. create Dictionary that store amount of likes
      let prodLikesDictionary = {}
      for (const productId of productsIds) {
        prodLikesDictionary[`${productId}`] = 0
      }

      // 4. iterate favoriteProductsList inside productsIds to get amount of likes per productId
      for (const productId of productsIds) {
        for (const favoriteProd of favoriteProducts) {
          prodLikesDictionary[productId] += (favoriteProd.productsList.includes(productId)) ? 1 : 0
        }
      }

      return {
        data: newProducts.map((prod) => {
          return {
            ...prod,
            totalLikes: prodLikesDictionary[prod.idProduct]
          }
        }),
        meta: {
          page: page,
          total: totalProducts,
          lastPage: lastPage
        }
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }
}
