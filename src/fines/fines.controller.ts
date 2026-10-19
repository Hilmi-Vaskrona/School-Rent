import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FinesService } from './fines.service';
import { PayFineDto, QueryFinesDto, WaiveFineDto } from './dto/fines.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Fines Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/fines')
export class FinesController {
  constructor(private readonly finesService: FinesService) {}

  @Get()
  @ApiOperation({
    summary:
      'Melihat daftar denda (Siswa: otomatis milik sendiri; Petugas/Admin: semua denda pengguna)',
  })
  async findAll(@GetUser() user: any, @Query() query: QueryFinesDto) {
    return this.finesService.findAll(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Melihat detail data denda berdasarkan ID' })
  async findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.finesService.findOne(id, user);
  }

  @Roles(UserRole.ADMIN, UserRole.PETUGAS)
  @Patch(':id/pay')
  @ApiOperation({ summary: 'Mencatat pelunasan denda (Khusus Petugas & Admin)' })
  @ApiResponse({ status: 200, description: 'Denda berhasil dilunasi (PAID)' })
  async pay(
    @Param('id') id: string,
    @GetUser('id') staffId: string,
    @Body() dto: PayFineDto,
  ) {
    return this.finesService.pay(id, staffId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.PETUGAS)
  @Patch(':id/waive')
  @ApiOperation({ summary: 'Membebaskan denda atas kebijakan sekolah (Khusus Petugas & Admin)' })
  @ApiResponse({ status: 200, description: 'Denda berhasil dibebaskan (WAIVED)' })
  async waive(
    @Param('id') id: string,
    @GetUser('id') staffId: string,
    @Body() dto: WaiveFineDto,
  ) {
    return this.finesService.waive(id, staffId, dto);
  }
}
