import 'multer';

import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Param,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationAccessGuard } from '../auth/guards/organization-access.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { UploadsService } from './uploads.service';

@Controller('organizations/:organizationId/uploads')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('product-image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadProductImage(
    @Param('organizationId')
    organizationId: string,

    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.uploadsService.uploadProductImage(file, organizationId);
  }

  @Post('table-image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadTableImage(
    @Param('organizationId') organizationId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadsService.uploadTableImage(file, organizationId);
  }

  @Post('organization-logo')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadOrganizationLogo(
    @Param('organizationId') organizationId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: string },
  ) {
    return this.uploadsService.uploadOrganizationLogo(
      file,
      organizationId,
      user.id,
    );
  }
}
