import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateItemDto, QueryItemsDto, UpdateItemDto } from './dto/items.dto';
import { ItemCondition, ItemStatus, LoanStatus } from '../common/enums/app.enums';

@Injectable()
export class ItemsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private checkSupabase() {
    if (!this.supabaseService.isReady) {
      throw new BadRequestException('Supabase belum terhubung. Konfigurasi .env terlebih dahulu.');
    }
  }

  async findAll(query: QueryItemsDto) {
    this.checkSupabase();

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    let q = this.supabaseService
      .from('items')
      .select('*, categories(id, name)', { count: 'exact' });

    if (query.category_id) {
      q = q.eq('category_id', query.category_id);
    }

    if (query.condition) {
      q = q.eq('condition', query.condition);
    }

    if (query.status) {
      q = q.eq('status', query.status);
    }

    if (query.only_available === 'true' || query.only_available === '1') {
      q = q.gt('available_stock', 0).eq('status', ItemStatus.AVAILABLE);
    }

    if (query.search) {
      const searchTerm = `%${query.search.trim()}%`;
      q = q.or(`name.ilike.${searchTerm},code.ilike.${searchTerm},description.ilike.${searchTerm}`);
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
      .from('items')
      .select('*, categories(id, name, description)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundException('Barang tidak ditemukan');
    }

    return data;
  }

  async create(dto: CreateItemDto) {
    this.checkSupabase();

    const trimmedCode = dto.code.trim().toUpperCase();

    // 1. Cek keunikan kode barang
    const { data: existingCode } = await this.supabaseService
      .from('items')
      .select('id')
      .eq('code', trimmedCode)
      .maybeSingle();

    if (existingCode) {
      throw new ConflictException(`Kode barang '${trimmedCode}' sudah terdaftar`);
    }

    // 2. Cek kategori valid
    const { data: category } = await this.supabaseService
      .from('categories')
      .select('id')
      .eq('id', dto.category_id)
      .maybeSingle();

    if (!category) {
      throw new BadRequestException('Kategori yang dipilih tidak valid atau tidak ditemukan');
    }

    // 3. Hitung available_stock
    const available_stock =
      dto.available_stock !== undefined ? dto.available_stock : dto.total_stock;

    if (available_stock > dto.total_stock) {
      throw new BadRequestException('Stok tersedia tidak boleh melebihi total stok barang');
    }

    const { data, error } = await this.supabaseService
      .from('items')
      .insert({
        category_id: dto.category_id,
        code: trimmedCode,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        image_url: dto.image_url || null,
        total_stock: dto.total_stock,
        available_stock,
        condition: dto.condition || ItemCondition.BAIK,
        status: dto.status || ItemStatus.AVAILABLE,
      })
      .select('*, categories(id, name)')
      .single();

    if (error) {
      throw new BadRequestException('Gagal menambahkan barang: ' + error.message);
    }

    return {
      message: 'Barang berhasil ditambahkan',
      data,
    };
  }

  async update(id: string, dto: UpdateItemDto) {
    this.checkSupabase();

    const currentItem = await this.findOne(id);

    if (dto.code) {
      const trimmedCode = dto.code.trim().toUpperCase();
      const { data: duplicate } = await this.supabaseService
        .from('items')
        .select('id')
        .eq('code', trimmedCode)
        .neq('id', id)
        .maybeSingle();

      if (duplicate) {
        throw new ConflictException(`Kode barang '${trimmedCode}' sudah digunakan oleh barang lain`);
      }
    }

    if (dto.category_id) {
      const { data: category } = await this.supabaseService
        .from('categories')
        .select('id')
        .eq('id', dto.category_id)
        .maybeSingle();

      if (!category) {
        throw new BadRequestException('Kategori tidak ditemukan');
      }
    }

    const total_stock = dto.total_stock !== undefined ? dto.total_stock : currentItem.total_stock;
    const available_stock =
      dto.available_stock !== undefined ? dto.available_stock : currentItem.available_stock;

    if (available_stock > total_stock) {
      throw new BadRequestException('Stok tersedia tidak boleh melebihi total stok barang');
    }

    const { data, error } = await this.supabaseService
      .from('items')
      .update({
        ...(dto.category_id ? { category_id: dto.category_id } : {}),
        ...(dto.code ? { code: dto.code.trim().toUpperCase() } : {}),
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
        ...(dto.image_url !== undefined ? { image_url: dto.image_url } : {}),
        ...(dto.total_stock !== undefined ? { total_stock: dto.total_stock } : {}),
        ...(dto.available_stock !== undefined ? { available_stock: dto.available_stock } : {}),
        ...(dto.condition ? { condition: dto.condition } : {}),
        ...(dto.status ? { status: dto.status } : {}),
      })
      .eq('id', id)
      .select('*, categories(id, name)')
      .single();

    if (error) {
      throw new BadRequestException('Gagal memperbarui barang: ' + error.message);
    }

    return {
      message: 'Barang berhasil diperbarui',
      data,
    };
  }

  async remove(id: string) {
    this.checkSupabase();

    await this.findOne(id);

    // Cek apakah ada peminjaman aktif yang masih menggunakan barang ini
    const { count, error: countErr } = await this.supabaseService
      .from('loans')
      .select('id', { count: 'exact', head: true })
      .eq('item_id', id)
      .in('status', [LoanStatus.PENDING, LoanStatus.APPROVED, LoanStatus.BORROWED, LoanStatus.OVERDUE]);

    if (countErr) {
      throw new BadRequestException(countErr.message);
    }

    if (count && count > 0) {
      throw new BadRequestException(
        `Barang tidak dapat dihapus karena sedang dalam peminjaman aktif (${count} transaksi). Selesaikan peminjaman terlebih dahulu.`,
      );
    }

    const { error } = await this.supabaseService.from('items').delete().eq('id', id);

    if (error) {
      throw new BadRequestException('Gagal menghapus barang: ' + error.message);
    }

    return {
      message: 'Barang berhasil dihapus',
    };
  }
}
