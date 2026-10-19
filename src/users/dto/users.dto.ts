import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '../../common/enums/role.enum';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Budi Santoso' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'XII RPL 1' })
  @IsOptional()
  @IsString()
  class_name?: string;

  @ApiPropertyOptional({ example: 'Rekayasa Perangkat Lunak' })
  @IsOptional()
  @IsString()
  major?: string;

  @ApiPropertyOptional({ example: '081234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://images.example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar_url?: string;
}

export class UpdateUserAdminDto extends UpdateProfileDto {
  @ApiPropertyOptional({ enum: UserRole, example: UserRole.PETUGAS })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role harus SISWA, PETUGAS, atau ADMIN' })
  role?: UserRole;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class ChangeRoleDto {
  @ApiProperty({ enum: UserRole, example: UserRole.PETUGAS, description: 'Role baru' })
  @IsNotEmpty({ message: 'Role tidak boleh kosong' })
  @IsEnum(UserRole, { message: 'Role harus SISWA, PETUGAS, atau ADMIN' })
  role: UserRole;
}

export class ToggleStatusDto {
  @ApiProperty({ example: false, description: 'Status aktif pengguna (true/false)' })
  @IsNotEmpty()
  @IsBoolean()
  is_active: boolean;
}

export class QueryUsersDto {
  @ApiPropertyOptional({ description: 'Pencarian nama atau email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: UserRole, description: 'Filter berdasarkan role' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Filter status aktif (true/false)' })
  @IsOptional()
  is_active?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  limit?: number;
}
