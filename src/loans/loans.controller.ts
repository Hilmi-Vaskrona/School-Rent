import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoansService } from './loans.service';
import {
  CancelLoanDto,
  CreateLoanDto,
  QueryLoansDto,
  RejectLoanDto,
} from './dto/loans.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Loans Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @ApiOperation({ summary: 'Mengajukan peminjaman barang baru (Siswa / User)' })
  @ApiResponse({ status: 201, description: 'Pengajuan berhasil dibuat dengan status PENDING' })
  async create(@GetUser('id') userId: string, @Body() dto: CreateLoanDto) {
    return this.loansService.create(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary:
      'Mendapatkan riwayat & daftar peminjaman (Siswa: otomatis milik sendiri; Petugas/Admin: semua peminjaman)',
  })
  async findAll(@GetUser() user: any, @Query() query: QueryLoansDto) {
    return this.loansService.findAll(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Melihat rincian data peminjaman berdasarkan ID' })
  async findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.loansService.findOne(id, user);
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.PETUGAS)
  @ApiOperation({ summary: 'Menyetujui pengajuan peminjaman (Khusus Petugas & Admin)' })
  async approve(@Param('id') id: string, @GetUser('id') staffId: string) {
    return this.loansService.approve(id, staffId);
  }

  @Patch(':id/handover')
  @Roles(UserRole.ADMIN, UserRole.PETUGAS)
  @ApiOperation({
    summary: 'Menyerahkan barang fisik ke siswa dan mengubah status menjadi BORROWED',
  })
  async handover(@Param('id') id: string, @GetUser('id') staffId: string) {
    return this.loansService.handover(id, staffId);
  }

  @Patch(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.PETUGAS)
  @ApiOperation({ summary: 'Menolak pengajuan peminjaman beserta alasan (Khusus Petugas & Admin)' })
  async reject(
    @Param('id') id: string,
    @GetUser('id') staffId: string,
    @Body() dto: RejectLoanDto,
  ) {
    return this.loansService.reject(id, staffId, dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Membatalkan pengajuan peminjaman (Khusus Siswa pemohon saat status PENDING)' })
  async cancel(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: UserRole,
    @Body() dto: CancelLoanDto,
  ) {
    return this.loansService.cancel(id, userId, userRole, dto);
  }
}
