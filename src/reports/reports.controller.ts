import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dto/reports.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@ApiTags('Reports & Statistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.PETUGAS)
@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('statistics')
  @ApiOperation({ summary: 'Mendapatkan ringkasan statistik keseluruhan sistem' })
  async getStatistics() {
    return this.reportsService.getOverallStatistics();
  }

  @Get('loans')
  @ApiOperation({ summary: 'Mendapatkan laporan peminjaman dengan filter periode/kategori/status' })
  async getLoansReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getLoansReport(filter);
  }

  @Get('returns')
  @ApiOperation({ summary: 'Mendapatkan laporan pengembalian berdasarkan periode' })
  async getReturnsReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getReturnsReport(filter);
  }

  @Get('top-items')
  @ApiOperation({ summary: 'Mendapatkan daftar barang yang paling sering dipinjam' })
  async getTopBorrowedItems(@Query('limit') limit?: number) {
    return this.reportsService.getTopBorrowedItems(Number(limit) || 10);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Mendapatkan daftar peminjaman yang sedang terlambat/melewati jatuh tempo' })
  async getOverdueReport() {
    return this.reportsService.getOverdueReport();
  }
}
