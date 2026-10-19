import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';
import { ProcessReturnDto, QueryReturnsDto } from './dto/returns.dto';
import { FineStatus, ItemCondition, ItemStatus, LoanStatus } from '../common/enums/app.enums';
import { UserRole } from '../common/enums/role.enum';

@Injectable()
export class ReturnsService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly notificationsService: NotificationsService,
    private readonly settingsService: SettingsService,
  ) {}

  private checkSupabase() {
    if (!this.supabaseService.isReady) {
      throw new BadRequestException('Supabase belum terhubung. Konfigurasi .env terlebih dahulu.');
    }
  }

  async processReturn(staffId: string, dto: ProcessReturnDto) {
    this.checkSupabase();

    // 1. Ambil data peminjaman
    const { data: loan, error: loanErr } = await this.supabaseService
      .from('loans')
      .select('*, items(id, name, available_stock, total_stock), users(id, name, email)')
      .eq('id', dto.loan_id)
      .maybeSingle();

    if (loanErr || !loan) {
      throw new NotFoundException('Data peminjaman tidak ditemukan');
    }

    if (loan.status === LoanStatus.RETURNED) {
      throw new ConflictException('Barang pada transaksi ini sudah pernah dikembalikan sebelumnya');
    }

    if (loan.status !== LoanStatus.BORROWED && loan.status !== LoanStatus.OVERDUE) {
      throw new BadRequestException(
        `Pengembalian hanya dapat diproses untuk peminjaman berstatus BORROWED atau OVERDUE. Status saat ini: ${loan.status}`,
      );
    }

    // 2. Hitung jumlah hari keterlambatan
    const now = new Date();
    const returnDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const dueParts = loan.due_date.split('-');
    const dueDay = new Date(
      parseInt(dueParts[0], 10),
      parseInt(dueParts[1], 10) - 1,
      parseInt(dueParts[2], 10),
    );

    const diffMs = returnDay.getTime() - dueDay.getTime();
    const daysOverdue = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;

    // 3. Catat di tabel returns
    const { data: returnRecord, error: returnErr } = await this.supabaseService
      .from('returns')
      .insert({
        loan_id: loan.id,
        processed_by: staffId,
        return_date: now.toISOString(),
        item_condition: dto.item_condition,
        damage_notes: dto.damage_notes?.trim() || null,
        notes: dto.notes?.trim() || null,
        days_overdue: daysOverdue,
      })
      .select()
      .single();

    if (returnErr) {
      throw new BadRequestException('Gagal memproses pengembalian: ' + returnErr.message);
    }

    // 4. Hitung denda jika terlambat (Fitur 9)
    let fineRecord: any = null;
    if (daysOverdue > 0) {
      const finePerDaySetting = await this.settingsService.getByKey('fine_per_day', '5000');
      const finePerDay = parseFloat(finePerDaySetting) || 5000;
      const totalFine = daysOverdue * finePerDay;

      const { data: createdFine, error: fineErr } = await this.supabaseService
        .from('fines')
        .insert({
          loan_id: loan.id,
          user_id: loan.user_id,
          days_overdue: daysOverdue,
          fine_per_day: finePerDay,
          total_fine: totalFine,
          status: FineStatus.UNPAID,
          notes: `Terlambat ${daysOverdue} hari dari batas tempo ${loan.due_date}`,
        })
        .select()
        .single();

      if (!fineErr && createdFine) {
        fineRecord = createdFine;
        await this.notificationsService.create(
          loan.user_id,
          'Denda Keterlambatan Diterbitkan',
          `Pengembalian barang '${loan.items?.name}' terlambat ${daysOverdue} hari. Denda yang harus dibayar: Rp ${totalFine.toLocaleString('id-ID')}.`,
          'FINE_CREATED',
          createdFine.id,
        );
      }
    }

    // 5. Kembalikan stok barang
    const item = loan.items;
    const restoredStock = Math.min(item.total_stock, item.available_stock + loan.quantity);

    let updatedItemStatus = ItemStatus.AVAILABLE;
    if (dto.item_condition === ItemCondition.RUSAK_BERAT) {
      updatedItemStatus = ItemStatus.MAINTENANCE;
    }

    await this.supabaseService
      .from('items')
      .update({
        available_stock: restoredStock,
        status: updatedItemStatus,
        condition: dto.item_condition !== ItemCondition.HILANG ? dto.item_condition : undefined,
      })
      .eq('id', item.id);

    // 6. Perbarui status pinjaman menjadi RETURNED
    await this.supabaseService
      .from('loans')
      .update({ status: LoanStatus.RETURNED })
      .eq('id', loan.id);

    // 7. Notifikasi ke siswa
    await this.notificationsService.create(
      loan.user_id,
      'Pengembalian Barang Selesai',
      `Barang '${item.name}' (${loan.loan_code}) telah berhasil dikembalikan dengan kondisi ${dto.item_condition}. Terima kasih.`,
      'ITEM_RETURNED',
      loan.id,
    );

    return {
      message: 'Pengembalian barang berhasil diproses (Status: RETURNED)',
      data: {
        return: returnRecord,
        fine: fineRecord,
        daysOverdue,
      },
    };
  }

  async findAll(user: any, query: QueryReturnsDto) {
    this.checkSupabase();

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    let q = this.supabaseService
      .from('returns')
      .select(
        '*, loans(*, items(id, name, code), users(id, name, email, class_name)), processed_by_user:users!returns_processed_by_fkey(id, name)',
        { count: 'exact' },
      );

    if (user.role === UserRole.SISWA) {
      q = q.eq('loans.user_id', user.id);
    } else if (query.user_id) {
      q = q.eq('loans.user_id', query.user_id);
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
      .from('returns')
      .select(
        '*, loans(*, items(id, name, code, image_url), users(id, name, email, phone, class_name)), processed_by_user:users!returns_processed_by_fkey(id, name)',
      )
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundException('Data pengembalian tidak ditemukan');
    }

    return data;
  }
}
