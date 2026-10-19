import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UserRole } from '../common/enums/role.enum';
import { FineStatus, ItemStatus, LoanStatus } from '../common/enums/app.enums';

@Injectable()
export class DashboardService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private checkSupabase() {
    if (!this.supabaseService.isReady) {
      throw new BadRequestException('Supabase belum terhubung. Konfigurasi .env terlebih dahulu.');
    }
  }

  async getStats(user: any) {
    this.checkSupabase();

    if (user.role === UserRole.SISWA) {
      return this.getStudentDashboard(user.id);
    } else if (user.role === UserRole.PETUGAS) {
      return this.getStaffDashboard();
    } else {
      return this.getAdminDashboard();
    }
  }

  private async getStudentDashboard(userId: string) {
    // 1. Peminjaman aktif
    const { count: activeLoans } = await this.supabaseService
      .from('loans')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', LoanStatus.BORROWED);

    // 2. Peminjaman pending
    const { count: pendingLoans } = await this.supabaseService
      .from('loans')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', LoanStatus.PENDING);

    // 3. Peminjaman disetujui (siap diambil)
    const { count: approvedLoans } = await this.supabaseService
      .from('loans')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', LoanStatus.APPROVED);

    // 4. Denda yang belum lunas
    const { data: unpaidFines } = await this.supabaseService
      .from('fines')
      .select('total_fine')
      .eq('user_id', userId)
      .eq('status', FineStatus.UNPAID);

    const totalUnpaidFine = (unpaidFines || []).reduce(
      (acc, curr) => acc + (parseFloat(curr.total_fine) || 0),
      0,
    );

    // 5. 5 Peminjaman terbaru
    const { data: recentLoans } = await this.supabaseService
      .from('loans')
      .select('*, items(id, name, code, image_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      role: UserRole.SISWA,
      summary: {
        activeLoans: activeLoans || 0,
        pendingLoans: pendingLoans || 0,
        approvedLoans: approvedLoans || 0,
        totalUnpaidFine,
      },
      recentLoans: recentLoans || [],
    };
  }

  private async getStaffDashboard() {
    // 1. Pengajuan baru PENDING
    const { count: newApplications } = await this.supabaseService
      .from('loans')
      .select('id', { count: 'exact', head: true })
      .eq('status', LoanStatus.PENDING);

    // 2. Peminjaman aktif BORROWED
    const { count: activeLoans } = await this.supabaseService
      .from('loans')
      .select('id', { count: 'exact', head: true })
      .eq('status', LoanStatus.BORROWED);

    // 3. Total pengembalian
    const { count: totalReturns } = await this.supabaseService
      .from('returns')
      .select('id', { count: 'exact', head: true });

    // 4. Peminjaman terlambat (due_date < hari ini dan status = BORROWED)
    const today = new Date().toISOString().slice(0, 10);
    const { count: overdueLoans } = await this.supabaseService
      .from('loans')
      .select('id', { count: 'exact', head: true })
      .eq('status', LoanStatus.BORROWED)
      .lt('due_date', today);

    // 5. Pengajuan pending terbaru
    const { data: pendingList } = await this.supabaseService
      .from('loans')
      .select('*, items(id, name, code), users(id, name, email, class_name)')
      .eq('status', LoanStatus.PENDING)
      .order('created_at', { ascending: true })
      .limit(5);

    return {
      role: UserRole.PETUGAS,
      summary: {
        newApplications: newApplications || 0,
        activeLoans: activeLoans || 0,
        totalReturns: totalReturns || 0,
        overdueLoans: overdueLoans || 0,
      },
      pendingApplications: pendingList || [],
    };
  }

  private async getAdminDashboard() {
    // 1. Total users
    const { count: totalUsers } = await this.supabaseService
      .from('users')
      .select('id', { count: 'exact', head: true });

    // 2. Total items
    const { count: totalItems } = await this.supabaseService
      .from('items')
      .select('id', { count: 'exact', head: true });

    const { count: availableItems } = await this.supabaseService
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('status', ItemStatus.AVAILABLE);

    const { count: borrowedItems } = await this.supabaseService
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('status', ItemStatus.BORROWED);

    // 3. Total loans
    const { count: totalLoans } = await this.supabaseService
      .from('loans')
      .select('id', { count: 'exact', head: true });

    // 4. Total Fines summary
    const { data: allFines } = await this.supabaseService
      .from('fines')
      .select('total_fine, status');

    let totalFineAmount = 0;
    let paidFineAmount = 0;
    let unpaidFineAmount = 0;

    (allFines || []).forEach((f) => {
      const val = parseFloat(f.total_fine) || 0;
      totalFineAmount += val;
      if (f.status === FineStatus.PAID) paidFineAmount += val;
      if (f.status === FineStatus.UNPAID) unpaidFineAmount += val;
    });

    return {
      role: UserRole.ADMIN,
      summary: {
        totalUsers: totalUsers || 0,
        totalItems: totalItems || 0,
        availableItems: availableItems || 0,
        borrowedItems: borrowedItems || 0,
        totalLoans: totalLoans || 0,
        totalFineAmount,
        paidFineAmount,
        unpaidFineAmount,
      },
    };
  }
}
