import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CancelLoanDto, CreateLoanDto, QueryLoansDto, RejectLoanDto } from './dto/loans.dto';
import { ItemStatus, LoanStatus } from '../common/enums/app.enums';
import { UserRole } from '../common/enums/role.enum';

@Injectable()
export class LoansService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private checkSupabase() {
    if (!this.supabaseService.isReady) {
      throw new BadRequestException('Supabase belum terhubung. Konfigurasi .env terlebih dahulu.');
    }
  }

  private generateLoanCode(): string {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `LOAN-${today}-${randomSuffix}`;
  }

  async create(userId: string, dto: CreateLoanDto) {
    this.checkSupabase();

    // 1. Validasi tanggal
    const borrowDate = new Date(dto.borrow_date);
    const dueDate = new Date(dto.due_date);

    if (isNaN(borrowDate.getTime()) || isNaN(dueDate.getTime())) {
      throw new BadRequestException('Format tanggal peminjaman atau jatuh tempo tidak valid');
    }

    if (dueDate < borrowDate) {
      throw new BadRequestException('Tanggal jatuh tempo tidak boleh mendahului tanggal peminjaman');
    }

    // 2. Ambil data barang & validasi ketersediaan
    const { data: item, error: itemError } = await this.supabaseService
      .from('items')
      .select('id, name, total_stock, available_stock, status, condition')
      .eq('id', dto.item_id)
      .maybeSingle();

    if (itemError || !item) {
      throw new NotFoundException('Barang yang ingin dipinjam tidak ditemukan');
    }

    if (item.status === ItemStatus.MAINTENANCE) {
      throw new BadRequestException(
        `Barang '${item.name}' sedang dalam masa perbaikan (MAINTENANCE) dan tidak dapat dipinjam.`,
      );
    }

    if (item.status === ItemStatus.INACTIVE) {
      throw new BadRequestException(`Barang '${item.name}' berstatus tidak aktif dalam sistem.`);
    }

    if (item.available_stock < dto.quantity) {
      throw new BadRequestException(
        `Stok barang '${item.name}' tidak mencukupi. Tersedia: ${item.available_stock}, Diminta: ${dto.quantity}.`,
      );
    }

    // 3. Buat pengajuan peminjaman dengan status PENDING
    const loanCode = this.generateLoanCode();

    const { data: newLoan, error: loanError } = await this.supabaseService
      .from('loans')
      .insert({
        loan_code: loanCode,
        user_id: userId,
        item_id: dto.item_id,
        quantity: dto.quantity,
        borrow_date: dto.borrow_date,
        due_date: dto.due_date,
        purpose: dto.purpose.trim(),
        notes: dto.notes?.trim() || null,
        status: LoanStatus.PENDING,
      })
      .select('*, items(id, name, code, image_url), users(id, name, email)')
      .single();

    if (loanError || !newLoan) {
      throw new BadRequestException('Gagal membuat pengajuan peminjaman: ' + loanError?.message);
    }

    // 4. Kirim notifikasi konfirmasi ke peminjam
    await this.notificationsService.create(
      userId,
      'Pengajuan Peminjaman Terkirim',
      `Pengajuan peminjaman ${item.name} (${dto.quantity} unit) dengan kode ${loanCode} telah berhasil dikirim dan menunggu verifikasi petugas.`,
      'LOAN_SUBMITTED',
      newLoan.id,
    );

    return {
      message: 'Pengajuan peminjaman berhasil dikirim (Status: PENDING)',
      data: newLoan,
    };
  }

  async findAll(user: any, query: QueryLoansDto) {
    this.checkSupabase();

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    let q = this.supabaseService
      .from('loans')
      .select(
        '*, items(id, name, code, image_url, condition, status, categories(id, name)), users(id, name, email, class_name, major, phone)',
        { count: 'exact' },
      );

    // Siswa hanya melihat riwayat peminjamannya sendiri (PRD Sec 16 & 22)
    if (user.role === UserRole.SISWA) {
      q = q.eq('user_id', user.id);
    } else if (query.user_id) {
      q = q.eq('user_id', query.user_id);
    }

    if (query.status) {
      q = q.eq('status', query.status);
    }

    if (query.item_id) {
      q = q.eq('item_id', query.item_id);
    }

    if (query.search) {
      const term = `%${query.search.trim()}%`;
      q = q.or(`loan_code.ilike.${term},purpose.ilike.${term}`);
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

    const { data: loan, error } = await this.supabaseService
      .from('loans')
      .select(
        '*, items(id, name, code, image_url, condition, status, categories(id, name)), users(id, name, email, class_name, major, phone), returns(*), fines(*)',
      )
      .eq('id', id)
      .maybeSingle();

    if (error || !loan) {
      throw new NotFoundException('Data peminjaman tidak ditemukan');
    }

    // Cek otorisasi data: siswa tidak boleh mengakses data peminjaman milik user lain
    if (user.role === UserRole.SISWA && loan.user_id !== user.id) {
      throw new ForbiddenException('Anda tidak berhak melihat data peminjaman pengguna lain');
    }

    return loan;
  }

  async approve(id: string, staffId: string) {
    this.checkSupabase();

    const { data: loan, error: loanErr } = await this.supabaseService
      .from('loans')
      .select('*, items(id, name, available_stock)')
      .eq('id', id)
      .maybeSingle();

    if (loanErr || !loan) {
      throw new NotFoundException('Peminjaman tidak ditemukan');
    }

    if (loan.status !== LoanStatus.PENDING) {
      throw new BadRequestException(
        `Hanya peminjaman dengan status PENDING yang dapat disetujui. Status saat ini: ${loan.status}`,
      );
    }

    const { data: updatedLoan, error: updateErr } = await this.supabaseService
      .from('loans')
      .update({
        status: LoanStatus.APPROVED,
        approved_by: staffId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, items(id, name), users(id, name, email)')
      .single();

    if (updateErr) {
      throw new BadRequestException('Gagal menyetujui peminjaman: ' + updateErr.message);
    }

    await this.notificationsService.create(
      loan.user_id,
      'Peminjaman Disetujui',
      `Pengajuan peminjaman barang '${loan.items?.name}' (${loan.loan_code}) telah DISETUJUI oleh petugas. Silakan mengambil barang di ruang sarpras.`,
      'LOAN_APPROVED',
      loan.id,
    );

    return {
      message: 'Peminjaman berhasil disetujui (Status: APPROVED)',
      data: updatedLoan,
    };
  }

  async handover(id: string, staffId: string) {
    this.checkSupabase();

    const { data: loan, error: loanErr } = await this.supabaseService
      .from('loans')
      .select('*, items(id, name, available_stock, total_stock)')
      .eq('id', id)
      .maybeSingle();

    if (loanErr || !loan) {
      throw new NotFoundException('Peminjaman tidak ditemukan');
    }

    if (loan.status !== LoanStatus.APPROVED && loan.status !== LoanStatus.PENDING) {
      throw new BadRequestException(
        `Penyerahan barang hanya bisa dilakukan untuk status APPROVED atau PENDING. Status saat ini: ${loan.status}`,
      );
    }

    const item = loan.items;
    if (item.available_stock < loan.quantity) {
      throw new BadRequestException(
        `Stok barang tidak mencukupi untuk diserahkan. Stok sisa: ${item.available_stock}, Dibutuhkan: ${loan.quantity}`,
      );
    }

    // 1. Kurangi stok barang
    const newStock = item.available_stock - loan.quantity;
    const newStatus = newStock === 0 ? ItemStatus.BORROWED : ItemStatus.AVAILABLE;

    await this.supabaseService
      .from('items')
      .update({ available_stock: newStock, status: newStatus })
      .eq('id', item.id);

    // 2. Ubah status peminjaman menjadi BORROWED
    const { data: updatedLoan, error: updateErr } = await this.supabaseService
      .from('loans')
      .update({
        status: LoanStatus.BORROWED,
        borrowed_at: new Date().toISOString(),
        approved_by: staffId,
        approved_at: loan.approved_at || new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, items(id, name), users(id, name, email)')
      .single();

    if (updateErr) {
      throw new BadRequestException('Gagal mengubah status penyerahan barang: ' + updateErr.message);
    }

    await this.notificationsService.create(
      loan.user_id,
      'Barang Berhasil Dipinjam',
      `Barang '${item.name}' telah resmi diserahkan kepada Anda. Harap kembalikan paling lambat ${loan.due_date}.`,
      'LOAN_BORROWED',
      loan.id,
    );

    return {
      message: 'Barang berhasil diserahkan dan status menjadi BORROWED',
      data: updatedLoan,
    };
  }

  async reject(id: string, staffId: string, dto: RejectLoanDto) {
    this.checkSupabase();

    const { data: loan, error: loanErr } = await this.supabaseService
      .from('loans')
      .select('*, items(id, name)')
      .eq('id', id)
      .maybeSingle();

    if (loanErr || !loan) {
      throw new NotFoundException('Peminjaman tidak ditemukan');
    }

    if (loan.status !== LoanStatus.PENDING && loan.status !== LoanStatus.APPROVED) {
      throw new BadRequestException(
        `Hanya peminjaman dengan status PENDING atau APPROVED yang dapat ditolak. Status saat ini: ${loan.status}`,
      );
    }

    const { data: updatedLoan, error: updateErr } = await this.supabaseService
      .from('loans')
      .update({
        status: LoanStatus.REJECTED,
        rejection_reason: dto.rejection_reason.trim(),
        approved_by: staffId,
      })
      .eq('id', id)
      .select('*, items(id, name), users(id, name, email)')
      .single();

    if (updateErr) {
      throw new BadRequestException('Gagal menolak peminjaman: ' + updateErr.message);
    }

    await this.notificationsService.create(
      loan.user_id,
      'Pengajuan Peminjaman Ditolak',
      `Pengajuan peminjaman barang '${loan.items?.name}' (${loan.loan_code}) DITOLAK oleh petugas. Alasan: ${dto.rejection_reason}`,
      'LOAN_REJECTED',
      loan.id,
    );

    return {
      message: 'Peminjaman berhasil ditolak (Status: REJECTED)',
      data: updatedLoan,
    };
  }

  async cancel(id: string, userId: string, userRole: UserRole, dto: CancelLoanDto) {
    this.checkSupabase();

    const { data: loan, error: loanErr } = await this.supabaseService
      .from('loans')
      .select('*, items(id, name)')
      .eq('id', id)
      .maybeSingle();

    if (loanErr || !loan) {
      throw new NotFoundException('Peminjaman tidak ditemukan');
    }

    // Siswa hanya boleh membatalkan peminjaman miliknya sendiri
    if (userRole === UserRole.SISWA && loan.user_id !== userId) {
      throw new ForbiddenException('Anda tidak berhak membatalkan pengajuan milik pengguna lain');
    }

    // PRD Section 13 & 22: Siswa hanya dapat membatalkan jika status masih PENDING
    if (loan.status !== LoanStatus.PENDING) {
      throw new BadRequestException(
        `Peminjaman hanya dapat dibatalkan saat status masih PENDING. Status saat ini: ${loan.status}`,
      );
    }

    const { data: updatedLoan, error: updateErr } = await this.supabaseService
      .from('loans')
      .update({
        status: LoanStatus.CANCELLED,
        cancellation_reason: dto.cancellation_reason?.trim() || 'Dibatalkan oleh peminjam',
      })
      .eq('id', id)
      .select('*, items(id, name)')
      .single();

    if (updateErr) {
      throw new BadRequestException('Gagal membatalkan peminjaman: ' + updateErr.message);
    }

    return {
      message: 'Peminjaman berhasil dibatalkan (Status: CANCELLED)',
      data: updatedLoan,
    };
  }
}
