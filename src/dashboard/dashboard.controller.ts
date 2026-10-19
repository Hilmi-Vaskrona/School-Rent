import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Mendapatkan statistik ringkasan dashboard yang disesuaikan dengan role login',
  })
  @ApiResponse({ status: 200, description: 'Ringkasan statistik dashboard sesuai role' })
  async getStats(@GetUser() user: any) {
    return this.dashboardService.getStats(user);
  }
}
