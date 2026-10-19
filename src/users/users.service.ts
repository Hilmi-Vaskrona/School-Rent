import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  ChangeRoleDto,
  QueryUsersDto,
  ToggleStatusDto,
  UpdateProfileDto,
  UpdateUserAdminDto,
} from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private checkSupabase() {
    if (!this.supabaseService.isReady) {
      throw new BadRequestException('Supabase belum terhubung. Konfigurasi .env terlebih dahulu.');
    }
  }

  async findAll(query: QueryUsersDto) {
    this.checkSupabase();

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    let q = this.supabaseService
      .from('users')
      .select('id, email, name, role, class_name, major, phone, avatar_url, is_active, created_at, updated_at', {
        count: 'exact',
      });

    if (query.role) {
      q = q.eq('role', query.role);
    }

    if (query.is_active !== undefined) {
      const activeBool = String(query.is_active).toLowerCase() === 'true';
      q = q.eq('is_active', activeBool);
    }

    if (query.search) {
      const searchTerm = `%${query.search.trim()}%`;
      q = q.or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`);
    }

    q = q.order('created_at', { ascending: false }).range(fromIndex, toIndex);

    const { data, count, error } = await q;

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      items: data || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async findOne(id: string) {
    this.checkSupabase();

    const { data, error } = await this.supabaseService
      .from('users')
      .select('id, email, name, role, class_name, major, phone, avatar_url, is_active, created_at, updated_at')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    return data;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    this.checkSupabase();

    const { data, error } = await this.supabaseService
      .from('users')
      .update({
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.class_name !== undefined ? { class_name: dto.class_name } : {}),
        ...(dto.major !== undefined ? { major: dto.major } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.avatar_url !== undefined ? { avatar_url: dto.avatar_url } : {}),
      })
      .eq('id', userId)
      .select('id, email, name, role, class_name, major, phone, avatar_url, is_active, updated_at')
      .single();

    if (error) {
      throw new BadRequestException('Gagal memperbarui profil: ' + error.message);
    }

    return {
      message: 'Profil berhasil diperbarui',
      data,
    };
  }

  async updateUserByAdmin(targetId: string, currentUserId: string, dto: UpdateUserAdminDto) {
    this.checkSupabase();

    // Aturan PRD: User tidak diperbolehkan mengubah role dirinya sendiri
    if (targetId === currentUserId && dto.role !== undefined) {
      const current = await this.findOne(currentUserId);
      if (current.role !== dto.role) {
        throw new ForbiddenException('Anda tidak diperbolehkan mengubah role akun Anda sendiri');
      }
    }

    const { data, error } = await this.supabaseService
      .from('users')
      .update({
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.role ? { role: dto.role } : {}),
        ...(dto.class_name !== undefined ? { class_name: dto.class_name } : {}),
        ...(dto.major !== undefined ? { major: dto.major } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.avatar_url !== undefined ? { avatar_url: dto.avatar_url } : {}),
        ...(dto.is_active !== undefined ? { is_active: dto.is_active } : {}),
      })
      .eq('id', targetId)
      .select('id, email, name, role, class_name, major, phone, avatar_url, is_active, updated_at')
      .single();

    if (error) {
      throw new BadRequestException('Gagal mengubah data pengguna: ' + error.message);
    }

    return {
      message: 'Data pengguna berhasil diperbarui oleh admin',
      data,
    };
  }

  async changeRole(targetId: string, currentUserId: string, dto: ChangeRoleDto) {
    this.checkSupabase();

    if (targetId === currentUserId) {
      throw new ForbiddenException('Anda tidak diperbolehkan mengubah role diri sendiri.');
    }

    const { data, error } = await this.supabaseService
      .from('users')
      .update({ role: dto.role })
      .eq('id', targetId)
      .select('id, email, name, role')
      .single();

    if (error) {
      throw new BadRequestException('Gagal mengubah role: ' + error.message);
    }

    return {
      message: `Role pengguna berhasil diubah menjadi ${dto.role}`,
      data,
    };
  }

  async toggleStatus(targetId: string, currentUserId: string, dto: ToggleStatusDto) {
    this.checkSupabase();

    if (targetId === currentUserId && !dto.is_active) {
      throw new ForbiddenException('Anda tidak dapat menonaktifkan akun Anda sendiri.');
    }

    const { data, error } = await this.supabaseService
      .from('users')
      .update({ is_active: dto.is_active })
      .eq('id', targetId)
      .select('id, email, name, is_active')
      .single();

    if (error) {
      throw new BadRequestException('Gagal mengubah status pengguna: ' + error.message);
    }

    return {
      message: `Status pengguna berhasil diubah menjadi ${dto.is_active ? 'Aktif' : 'Nonaktif'}`,
      data,
    };
  }
}
