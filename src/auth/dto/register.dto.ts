import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Budi Pratama', description: 'Nama lengkap pengguna' })
  @IsString({ message: 'Nama harus berupa string' })
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  name: string;

  @ApiProperty({ example: 'budi@schoolrent.com', description: 'Alamat email aktif' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'Password minimal 6 karakter', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password minimal terdiri dari 6 karakter' })
  password: string;

  @ApiPropertyOptional({ example: 'XII RPL 1', description: 'Kelas (khusus siswa)' })
  @IsOptional()
  @IsString()
  class_name?: string;

  @ApiPropertyOptional({ example: 'Rekayasa Perangkat Lunak', description: 'Jurusan (khusus siswa)' })
  @IsOptional()
  @IsString()
  major?: string;

  @ApiPropertyOptional({ example: '081234567890', description: 'Nomor telepon/HP aktif' })
  @IsOptional()
  @IsString()
  phone?: string;
}
