import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PayFineDto, QueryFinesDto, WaiveFineDto } from './dto/fines.dto';
import { FineStatus } from '../common/enums/app.enums';
import { UserRole } from '../common/enums/role.enum';

@Injectable()
export class FinesService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private checkSupabase() {
    if (!this.supabaseService.isReady) {
      throw new BadRequestException('Supabase belum terhubung. Konfigurasi .env terlebih dahulu.');
    }
  }

  async findAll(user: any, query: QueryFinesDto) {
    this.checkSupabase();

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    let q = this.supabaseService
      .from('fines')
      .select(
        '*, users(id, name, email, class_name, phone), loans(id, loan_code, due_date, items(id, name, code)), handled_by_user:users!fines_handled_by_fkey(id, name)',
        { count: 'exact' },
      );

    if (user.role === UserRole.SISWA) {
      q = q.eq('user_id', user.id);
    } else if (query.user_id) {
      q = q.eq('user_id', query.user_id);
    }

    if (query.status) {
      q = q.eq('status', query.status);
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

  async findOne(id: string, user: any) {
    this.checkSupabase();

    const { data, error } = await this.supabaseService
      .from('fines')
      .select(
        '*, users(id, name, email, class_name, phone), loans(*, items(id, name, code, image_url)), handled_by_user:users!fines_handled_by_fkey(id, name)',
      )
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundException('Data denda tidak ditemukan');
    }

    if (user.role === UserRole.SISWA && data.user_id !== user.id) {
      throw new ForbiddenException('Anda tidak berhak melihat data denda pengguna lain');
    }

    return data;
  }

  async pay(id: string, staffId: string, dto: PayFineDto) {
    this.checkSupabase();

    const currentFine = await this.findOne(id, { role: UserRole.ADMIN });

    if (currentFine.status === FineStatus.PAID) {
      throw new BadRequestException('Denda ini sudah lunas sebelumnya');
    }

    const { data, error } = await this.supabaseService
      .from('fines')
      .update({
        status: FineStatus.PAID,
        paid_at: new Date().toISOString(),
        handled_by: staffId,
        payment_notes: dto.notes?.trim() || 'Pembayaran denda lunas',
      })
      .eq('id', id)
      .select('*, users(id, name, email), loans(loan_code)')
      .single();

    if (error) {
      throw new BadRequestException('Gagal memproses pelunasan denda: ' + error.message);
    }

    await this.notificationsService.create(
      currentFine.user_id,
      'Denda Telah Dibayar',
      `Denda keterlambatan sebesar Rp ${Number(currentFine.total_fine).toLocaleString('id-ID')} telah berhasil dilunasi.`,
      'FINE_PAID',
      id,
    );

    return {
      message: 'Pembayaran denda berhasil dicatat (Status: PAID)',
      data,
    };
  }

  async waive(id: string, staffId: string, dto: WaiveFineDto) {
    this.checkSupabase();

    const currentFine = await this.findOne(id, { role: UserRole.ADMIN });

    if (currentFine.status === FineStatus.PAID) {
      throw new BadRequestException('Denda yang sudah dibayar tidak dapat dibebaskan');
    }

    const { data, error } = await this.supabaseService
      .from('fines')
      .update({
        status: FineStatus.WAIVED,
        handled_by: staffId,
        payment_notes: dto.reason?.trim() || 'Denda dibebaskan oleh kebijakan sekolah',
      })
      .eq('id', id)
      .select('*, users(id, name, email), loans(loan_code)')
      .single();

    if (error) {
      throw new BadRequestException('Gagal membebaskan denda: ' + error.message);
    }

    await this.notificationsService.create(
      currentFine.user_id,
      'Denda Keterlambatan Dibebaskan',
      `Denda keterlambatan Anda sebesar Rp ${Number(currentFine.total_fine).toLocaleString('id-ID')} telah dibebaskan oleh pihak sekolah.`,
      'FINE_WAIVED',
      id,
    );

    return {
      message: 'Denda berhasil dibebaskan (Status: WAIVED)',
      data,
    };
  }
}
