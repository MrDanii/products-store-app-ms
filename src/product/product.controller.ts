import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateCategoryDto, CreateProductDto, FindCategoryDto, ProductRatingDto, UpdateCategoryDto, UpdateProductDto } from './dto';
import { TermDto } from 'src/common';
import { ProductRating } from '@prisma/client';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern('category.create')
  createCategory(@Payload() createCategoryDto: CreateCategoryDto) {
    return this.productService.createCategory(createCategoryDto)
  }

  @MessagePattern('cetagory.find.all')
  findAllCategories(@Payload() paginationDto) {
    return this.productService.findAllCategories(paginationDto)
  }

  @MessagePattern('category.find.one')
  findCategory(@Payload() termDto: TermDto) {
    return this.productService.findCategory(termDto)
  }

  @MessagePattern('category.update')
  updateCategory(@Payload() updateCategoryDto: UpdateCategoryDto) {
    return this.productService.updateCategory(updateCategoryDto.idCategory, updateCategoryDto)
  }

  @MessagePattern('category.active.toggle')
  toggleActive(@Payload() idCategory: number) {
    return this.productService.toggleActiveCategory(idCategory)
  }

  @MessagePattern('category.remove')
  removeCategory(@Payload() idCategory: number) {
    return this.productService.removeCategory(idCategory)
  }

  @MessagePattern('product.create')
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @MessagePattern('product.find.all')
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.productService.findAllProducts(paginationDto);
  }

  @MessagePattern('product.find.id')
  findOneProduct(@Payload() idProduct: string) {
    return this.productService.findOneProduct(idProduct)
  }

  @MessagePattern('product.update')
  update(@Payload() updateProductDto: UpdateProductDto) {
    return this.productService.update(updateProductDto.idProduct, updateProductDto);
  }

  // @MessagePattern('product.remove')
  // deactivateProduct(@Payload() id: number) {
  //   return this.productService.deactivateProduct(id);
  // }

  @MessagePattern('product.rate')
  rateProduct(@Payload() productRatingDto: ProductRatingDto) {
    return this.productService.rateProduct(productRatingDto)
  }

}
