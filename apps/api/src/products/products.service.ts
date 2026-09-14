import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    organizationId: string,
    dto: CreateProductDto,
  ) {
    if (dto.sku) {
      const existingSku = await this.prisma.product.findFirst({
        where: {
          organizationId,
          sku: dto.sku,
        },
        select: {
          id: true,
        },
      });

      if (existingSku) {
        throw new ConflictException(
          'A product with this SKU already exists.',
        );
      }
    }

    if (dto.categoryId) {
      const category =
        await this.prisma.productCategory.findFirst({
          where: {
            id: dto.categoryId,
            organizationId,
          },
          select: {
            id: true,
          },
        });

      if (!category) {
        throw new NotFoundException(
          'Product category not found.',
        );
      }
    }

    return this.prisma.product.create({
      data: {
        organizationId,
        name: dto.name,
        description: dto.description,
        sku: dto.sku,
        price: dto.price,
        cost: dto.cost,
        categoryId: dto.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.product.findMany({
      where: {
        organizationId,
      },
      include: {
        category: true,
      },
      orderBy: [
        {
          status: 'asc',
        },
        {
          name: 'asc',
        },
      ],
    });
  }

  async findOne(
    organizationId: string,
    productId: string,
  ) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        organizationId,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return product;
  }

  async update(
    organizationId: string,
    productId: string,
    dto: UpdateProductDto,
  ) {
    await this.findOne(organizationId, productId);

    if (dto.sku) {
      const existingSku =
        await this.prisma.product.findFirst({
          where: {
            organizationId,
            sku: dto.sku,
            NOT: {
              id: productId,
            },
          },
          select: {
            id: true,
          },
        });

      if (existingSku) {
        throw new ConflictException(
          'A product with this SKU already exists.',
        );
      }
    }

    if (dto.categoryId) {
      const category =
        await this.prisma.productCategory.findFirst({
          where: {
            id: dto.categoryId,
            organizationId,
          },
          select: {
            id: true,
          },
        });

      if (!category) {
        throw new NotFoundException(
          'Product category not found.',
        );
      }
    }

    return this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name,
        }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.sku !== undefined && {
          sku: dto.sku,
        }),
        ...(dto.price !== undefined && {
          price: dto.price,
        }),
        ...(dto.cost !== undefined && {
          cost: dto.cost,
        }),
        ...(dto.categoryId !== undefined && {
          categoryId: dto.categoryId,
        }),
      },
      include: {
        category: true,
      },
    });
  }

  async archive(
    organizationId: string,
    productId: string,
  ) {
    await this.findOne(organizationId, productId);

    return this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        status: 'ARCHIVED',
      },
    });
  }
}