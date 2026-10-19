import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SupabaseService } from '../../supabase/supabase.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'schoolrent_super_secure_jwt_secret_key_2026_xyz',
    });
  }

  async validate(payload: JwtPayload) {
    if (!this.supabaseService.isReady) {
      // Jika Supabase belum dikonfigurasi, gunakan data dari token langsung
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    }

    const { data: user, error } = await this.supabaseService
      .from('users')
      .select('id, email, name, role, class_name, major, phone, avatar_url, is_active')
      .eq('id', payload.sub)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Pengguna tidak ditemukan atau sesi sudah tidak valid');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Akun pengguna dinonaktifkan oleh administrator');
    }

    return user;
  }
}
