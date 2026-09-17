import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { SettingsService } from './settings.service';
import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';
import { UpdateBranchSettingsDto } from './dto/update-branch-settings.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('organizations/:organizationId')
  getOrganizationSettings(
    @CurrentUser() user: { id: string },
    @Param('organizationId') organizationId: string,
  ) {
    return this.settingsService.getOrganizationSettings(
      user.id,
      organizationId,
    );
  }

  @Patch('organizations/:organizationId')
  updateOrganizationSettings(
    @CurrentUser() user: { id: string },
    @Param('organizationId') organizationId: string,
    @Body() dto: UpdateOrganizationSettingsDto,
  ) {
    return this.settingsService.updateOrganizationSettings(
      user.id,
      organizationId,
      dto,
    );
  }

  @Get('organizations/:organizationId/branches/:branchId')
  getBranchSettings(
    @CurrentUser() user: { id: string },
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.settingsService.getBranchSettings(
      user.id,
      organizationId,
      branchId,
    );
  }

  @Patch('organizations/:organizationId/branches/:branchId')
  updateBranchSettings(
    @CurrentUser() user: { id: string },
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Body() dto: UpdateBranchSettingsDto,
  ) {
    return this.settingsService.updateBranchSettings(
      user.id,
      organizationId,
      branchId,
      dto,
    );
  }
}
