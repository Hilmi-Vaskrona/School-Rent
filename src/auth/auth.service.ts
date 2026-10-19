import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto, LoginDto } from './dto/login.dto';
import { UserRole } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
  ) {}

  private checkSupabaseReady() {
    if (!this.supabaseService.isReady) {
      throw new BadRequestException(
        'Koneksi Supabase belum aktif! Harap lengkapi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY pada file .env terlebih dahulu.',
      );
    }
  }

  async register(dto: RegisterDto) {
    this.checkSupabaseReady();

    // 1. Cek apakah email sudah terdaftar
    const { data: existingUser } = await this.supabaseService
      .from('users')
      .select('id, email')
      .eq('email', dto.email.toLowerCase().trim())
      .maybeSingle();

    if (existingUser) {
      throw new ConflictException('Email ini sudah terdaftar. Silakan gunakan email lain atau login.');
    }

    // 2. Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(dto.password, saltRounds);

    // 3. Simpan pengguna baru dengan role default SISWA
    const { data: newUser, error } = await this.supabaseService
      .from('users')
      .insert({
        email: dto.email.toLowerCase().trim(),
        name: dto.name.trim(),
        password_hash,
        role: UserRole.SISWA,
        class_name: dto.class_name || null,
        major: dto.major || null,
        phone: dto.phone || null,
        is_active: true,
      })
      .select('id, email, name, role, class_name, major, phone, avatar_url, is_active, created_at')
      .single();

    if (error || !newUser) {
      this.logger.error('Gagal mendaftarkan user baru:', error);
      throw new BadRequestException(error?.message || 'Gagal membuat akun pengguna.');
    }

    // 4. Generate JWT Token
    const payload = { sub: newUser.id, email: newUser.email, role: newUser.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Registrasi berhasil',
      accessToken,
      user: newUser,
    };
  }

  async login(dto: LoginDto) {
    this.checkSupabaseReady();

    // 1. Ambil data user beserta password_hash
    const { data: user, error } = await this.supabaseService
      .from('users')
      .select('id, email, password_hash, name, role, class_name, major, phone, avatar_url, is_active')
      .eq('email', dto.email.toLowerCase().trim())
      .maybeSingle();

    if (error || !user) {
      throw new UnauthorizedException('Email atau password tidak valid');
    }

    // 2. Cek status keaktifan akun
    if (!user.is_active) {
      throw new UnauthorizedException('Akun Anda dinonaktifkan oleh Administrator. Hubungi pihak sekolah.');
    }

    // 3. Verifikasi kecocokan password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password tidak valid');
    }

    // 4. Generate JWT Token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    // Hilangkan password_hash dari response
    const { password_hash, ...safeUser } = user;

    return {
      message: 'Login berhasil',
      accessToken,
      user: safeUser,
    };
  }

  async getProfile(userId: string) {
    this.checkSupabaseReady();

    const { data: user, error } = await this.supabaseService
      .from('users')
      .select('id, email, name, role, class_name, major, phone, avatar_url, is_active, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Pengguna tidak ditemukan');
    }

    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    this.checkSupabaseReady();

    const { data: user, error } = await this.supabaseService
      .from('users')
      .select('id, password_hash')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Pengguna tidak ditemukan');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password_hash);
    if (!isMatch) {
      throw new BadRequestException('Password lama yang Anda masukkan tidak sesuai');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
    const { error: updateError } = await this.supabaseService
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId);

    if (updateError) {
      throw new BadRequestException('Gagal memperbarui password');
    }

    return {
      message: 'Password berhasil diperbarui',
    };
  }
}
