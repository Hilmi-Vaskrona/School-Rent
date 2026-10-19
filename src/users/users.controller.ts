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
import { UsersService } from './users.service';
import {
  ChangeRoleDto,
  QueryUsersDto,
  ToggleStatusDto,
  UpdateProfileDto,
  UpdateUserAdminDto,
} from './dto/users.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Users Management & Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PETUGAS)
  @ApiOperation({ summary: 'Daftar semua pengguna (Khusus Petugas & Admin)' })
  async findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Mendapatkan data profil diri sendiri' })
  async getMyProfile(@GetUser('id') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Memperbarui profil diri sendiri' })
  async updateMyProfile(
    @GetUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PETUGAS)
  @ApiOperation({ summary: 'Melihat detail data pengguna berdasarkan ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mengedit data pengguna (Khusus Admin)' })
  async updateByAdmin(
    @Param('id') id: string,
    @GetUser('id') currentUserId: string,
    @Body() dto: UpdateUserAdminDto,
  ) {
    return this.usersService.updateUserByAdmin(id, currentUserId, dto);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mengubah role pengguna (Khusus Admin)' })
  async changeRole(
    @Param('id') id: string,
    @GetUser('id') currentUserId: string,
    @Body() dto: ChangeRoleDto,
  ) {
    return this.usersService.changeRole(id, currentUserId, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mengaktifkan / Menonaktifkan akun pengguna (Khusus Admin)' })
  async toggleStatus(
    @Param('id') id: string,
    @GetUser('id') currentUserId: string,
    @Body() dto: ToggleStatusDto,
  ) {
    return this.usersService.toggleStatus(id, currentUserId, dto);
  }
}
