import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/setting.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Public } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@ApiTags('System Settings')
@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Mendapatkan seluruh konfigurasi sistem (misal denda/hari)' })
  async getAll() {
    return this.settingsService.getAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Patch(':key')
  @ApiOperation({ summary: 'Mengubah nilai konfigurasi sistem (Khusus Admin)' })
  async update(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
    return this.settingsService.update(key, dto.value);
  }
}
