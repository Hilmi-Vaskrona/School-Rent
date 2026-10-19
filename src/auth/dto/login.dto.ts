import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@schoolrent.com', description: 'Email akun terdaftar' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'Password akun' })
  @IsString()
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'Password123!', description: 'Password lama' })
  @IsString()
  @IsNotEmpty({ message: 'Password saat ini harus diisi' })
  currentPassword: string;

  @ApiProperty({ example: 'NewSecret123!', description: 'Password baru', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password baru minimal 6 karakter' })
  newPassword: string;
}
