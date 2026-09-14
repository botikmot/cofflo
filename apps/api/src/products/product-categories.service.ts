import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Injectable()
export class ProductCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    organizationId: string,
    dto: CreateProductCategoryDto,
  ) {
    const existingCategory =
      await this.prisma.productCategory.findFirst({
        where: {
          organizationId,
          name: dto.name,
        },
        select: {
          id: true,
        },
      });

    if (existingCategory) {
      throw new ConflictException(
        'A product category with this name already exists.',
      );
    }

    return this.prisma.productCategory.create({
      data: {
        organizationId,
        name: dto.name,
        description: dto.description,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.productCategory.findMany({
      where: {
        organizationId,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: [
        {
          sortOrder: 'asc',
        },
        {
          name: 'asc',
        },
      ],
    });
  }

  async findOne(
    organizationId: string,
    categoryId: string,
  ) {
    const category =
      await this.prisma.productCategory.findFirst({
        where: {
          id: categoryId,
          organizationId,
        },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

    if (!category) {
      throw new NotFoundException(
        'Product category not found.',
      );
    }

    return category;
  }

  async update(
    organizationId: string,
    categoryId: string,
    dto: UpdateProductCategoryDto,
  ) {
    await this.findOne(
      organizationId,
      categoryId,
    );

    if (dto.name) {
      const existingCategory =
        await this.prisma.productCategory.findFirst({
          where: {
            organizationId,
            name: dto.name,
            NOT: {
              id: categoryId,
            },
          },
          select: {
            id: true,
          },
        });

      if (existingCategory) {
        throw new ConflictException(
          'A product category with this name already exists.',
        );
      }
    }

    return this.prisma.productCategory.update({
      where: {
        id: categoryId,
      },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name,
        }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.sortOrder !== undefined && {
          sortOrder: dto.sortOrder,
        }),
      },
    });
  }

  async archive(
    organizationId: string,
    categoryId: string,
  ) {
    await this.findOne(
      organizationId,
      categoryId,
    );

    return this.prisma.productCategory.update({
      where: {
        id: categoryId,
      },
      data: {
        isActive: false,
      },
    });
  }
}