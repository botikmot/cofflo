import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationAccessGuard } from '../auth/guards/organization-access.guard';

import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { ProductCategoriesService } from './product-categories.service';

@Controller(
  'organizations/:organizationId/product-categories',
)
@UseGuards(
  JwtAuthGuard,
  OrganizationAccessGuard,
)
export class ProductCategoriesController {
  constructor(
    private readonly productCategoriesService: ProductCategoriesService,
  ) {}

  @Post()
  create(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateProductCategoryDto,
  ) {
    return this.productCategoriesService.create(
      organizationId,
      dto,
    );
  }

  @Get()
  findAll(
    @Param('organizationId') organizationId: string,
  ) {
    return this.productCategoriesService.findAll(
      organizationId,
    );
  }

  @Get(':categoryId')
  findOne(
    @Param('organizationId') organizationId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.productCategoriesService.findOne(
      organizationId,
      categoryId,
    );
  }

  @Patch(':categoryId')
  update(
    @Param('organizationId') organizationId: string,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateProductCategoryDto,
  ) {
    return this.productCategoriesService.update(
      organizationId,
      categoryId,
      dto,
    );
  }

  @Delete(':categoryId')
  archive(
    @Param('organizationId') organizationId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.productCategoriesService.archive(
      organizationId,
      categoryId,
    );
  }
}