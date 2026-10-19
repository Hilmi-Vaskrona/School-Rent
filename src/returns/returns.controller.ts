import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { ProcessReturnDto, QueryReturnsDto } from './dto/returns.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Returns Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Roles(UserRole.ADMIN, UserRole.PETUGAS)
  @Post()
  @ApiOperation({
    summary:
      'Memproses pengembalian barang, mencatat kondisi, memulihkan stok, dan menghitung denda otomatis jika terlambat',
  })
  @ApiResponse({ status: 201, description: 'Pengembalian berhasil dicatat' })
  async processReturn(@GetUser('id') staffId: string, @Body() dto: ProcessReturnDto) {
    return this.returnsService.processReturn(staffId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Mendapatkan riwayat pengembalian barang' })
  async findAll(@GetUser() user: any, @Query() query: QueryReturnsDto) {
    return this.returnsService.findAll(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Melihat detail data pengembalian berdasarkan ID' })
  async findOne(@Param('id') id: string) {
    return this.returnsService.findOne(id);
  }
}
