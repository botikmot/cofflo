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

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('organizations/:organizationId/products')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(organizationId, dto);
  }

  @Get()
  findAll(@Param('organizationId') organizationId: string) {
    return this.productsService.findAll(organizationId);
  }

  @Get(':productId')
  findOne(
    @Param('organizationId') organizationId: string,
    @Param('productId') productId: string,
  ) {
    return this.productsService.findOne(organizationId, productId);
  }

  @Patch(':productId')
  update(
    @Param('organizationId') organizationId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(organizationId, productId, dto);
  }

  @Delete(':productId')
  archive(
    @Param('organizationId') organizationId: string,
    @Param('productId') productId: string,
  ) {
    return this.productsService.archive(organizationId, productId);
  }
}
