import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationAccessGuard } from '../auth/guards/organization-access.guard';

@Controller()
export class BranchesController {
  constructor(
    private readonly branchesService: BranchesService,
  ) {}

  @Post('organizations/:organizationId/branches')
  @UseGuards(
    JwtAuthGuard,
    OrganizationAccessGuard,
  )
  create(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateBranchDto,
  ) {
    return this.branchesService.create(
      organizationId,
      dto,
    );
  }

  @Get('organizations/:organizationId/branches')
  @UseGuards(
    JwtAuthGuard,
    OrganizationAccessGuard,
  )
  findAllByOrganization(
    @Param('organizationId') organizationId: string,
  ) {
    return this.branchesService.findAllByOrganization(
      organizationId,
    );
  }

  @Get('branches/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }
}