import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private checkSupabase() {
    if (!this.supabaseService.isReady) {
      throw new BadRequestException('Supabase belum terhubung. Konfigurasi .env terlebih dahulu.');
    }
  }

  async findAll() {
    this.checkSupabase();

    const { data, error } = await this.supabaseService
      .from('categories')
      .select('id, name, description, created_at, updated_at')
      .order('name', { ascending: true });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data || [];
  }

  async findOne(id: string) {
    this.checkSupabase();

    const { data, error } = await this.supabaseService
      .from('categories')
      .select('id, name, description, created_at, updated_at')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    return data;
  }

  async create(dto: CreateCategoryDto) {
    this.checkSupabase();

    const trimmedName = dto.name.trim();

    // Cek nama unik
    const { data: existing } = await this.supabaseService
      .from('categories')
      .select('id')
      .ilike('name', trimmedName)
      .maybeSingle();

    if (existing) {
      throw new ConflictException(`Kategori '${trimmedName}' sudah ada`);
    }

    const { data, error } = await this.supabaseService
      .from('categories')
      .insert({
        name: trimmedName,
        description: dto.description?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Gagal membuat kategori: ' + error.message);
    }

    return {
      message: 'Kategori berhasil ditambahkan',
      data,
    };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    this.checkSupabase();

    await this.findOne(id);

    if (dto.name) {
      const trimmedName = dto.name.trim();
      const { data: duplicate } = await this.supabaseService
        .from('categories')
        .select('id')
        .ilike('name', trimmedName)
        .neq('id', id)
        .maybeSingle();

      if (duplicate) {
        throw new ConflictException(`Kategori dengan nama '${trimmedName}' sudah digunakan`);
      }
    }

    const { data, error } = await this.supabaseService
      .from('categories')
      .update({
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Gagal memperbarui kategori: ' + error.message);
    }

    return {
      message: 'Kategori berhasil diperbarui',
      data,
    };
  }

  async remove(id: string) {
    this.checkSupabase();

    await this.findOne(id);

    // Cek apakah masih ada barang yang terhubung ke kategori ini
    const { count, error: countErr } = await this.supabaseService
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countErr) {
      throw new BadRequestException(countErr.message);
    }

    if (count && count > 0) {
      throw new BadRequestException(
        `Kategori tidak dapat dihapus karena masih digunakan oleh ${count} barang. Pindahkan atau hapus barang terlebih dahulu.`,
      );
    }

    const { error } = await this.supabaseService.from('categories').delete().eq('id', id);

    if (error) {
      throw new BadRequestException('Gagal menghapus kategori: ' + error.message);
    }

    return {
      message: 'Kategori berhasil dihapus',
    };
  }
}
