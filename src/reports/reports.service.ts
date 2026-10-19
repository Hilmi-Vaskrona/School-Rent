import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ReportFilterDto } from './dto/reports.dto';
import { FineStatus, ItemStatus, LoanStatus } from '../common/enums/app.enums';

@Injectable()
export class ReportsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private checkSupabase() {
    if (!this.supabaseService.isReady) {
      throw new BadRequestException('Supabase belum terhubung. Konfigurasi .env terlebih dahulu.');
    }
  }

  async getOverallStatistics() {
    this.checkSupabase();

    // Barang
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

    const { count: maintenanceItems } = await this.supabaseService
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('status', ItemStatus.MAINTENANCE);

    // Peminjaman
    const { count: totalLoans } = await this.supabaseService
      .from('loans')
      .select('id', { count: 'exact', head: true });

    const { count: activeLoans } = await this.supabaseService
      .from('loans')
      .select('id', { count: 'exact', head: true })
      .eq('status', LoanStatus.BORROWED);

    const { count: returnedLoans } = await this.supabaseService
      .from('loans')
      .select('id', { count: 'exact', head: true })
      .eq('status', LoanStatus.RETURNED);

    const today = new Date().toISOString().slice(0, 10);
    const { count: overdueLoans } = await this.supabaseService
      .from('loans')
      .select('id', { count: 'exact', head: true })
      .eq('status', LoanStatus.BORROWED)
      .lt('due_date', today);

    // Denda
    const { data: finesData } = await this.supabaseService
      .from('fines')
      .select('total_fine, status');

    let totalFineAmount = 0;
    let paidFineAmount = 0;
    let unpaidFineAmount = 0;

    (finesData || []).forEach((f) => {
      const val = parseFloat(f.total_fine) || 0;
      totalFineAmount += val;
      if (f.status === FineStatus.PAID) paidFineAmount += val;
      if (f.status === FineStatus.UNPAID) unpaidFineAmount += val;
    });

    return {
      items: {
        total: totalItems || 0,
        available: availableItems || 0,
        borrowed: borrowedItems || 0,
        maintenance: maintenanceItems || 0,
      },
      loans: {
        total: totalLoans || 0,
        active: activeLoans || 0,
        returned: returnedLoans || 0,
        overdue: overdueLoans || 0,
      },
      fines: {
        totalAmount: totalFineAmount,
        paidAmount: paidFineAmount,
        unpaidAmount: unpaidFineAmount,
      },
    };
  }

  async getLoansReport(filter: ReportFilterDto) {
    this.checkSupabase();

    let q = this.supabaseService
      .from('loans')
      .select('*, items(*, categories(name)), users(id, name, email, class_name, major, phone)');

    if (filter.start_date) {
      q = q.gte('borrow_date', filter.start_date);
    }

    if (filter.end_date) {
      q = q.lte('borrow_date', filter.end_date);
    }

    if (filter.status) {
      q = q.eq('status', filter.status);
    }

    if (filter.category_id) {
      q = q.eq('items.category_id', filter.category_id);
    }

    q = q.order('created_at', { ascending: false });

    const { data, error } = await q;

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      total: data?.length || 0,
      records: data || [],
    };
  }

  async getReturnsReport(filter: ReportFilterDto) {
    this.checkSupabase();

    let q = this.supabaseService
      .from('returns')
      .select('*, loans(*, items(id, name, code), users(id, name, email, class_name)), processed_by_user:users!returns_processed_by_fkey(name)');

    if (filter.start_date) {
      q = q.gte('return_date', filter.start_date);
    }

    if (filter.end_date) {
      q = q.lte('return_date', `${filter.end_date}T23:59:59`);
    }

    q = q.order('return_date', { ascending: false });

    const { data, error } = await q;

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      total: data?.length || 0,
      records: data || [],
    };
  }

  async getTopBorrowedItems(limit = 10) {
    this.checkSupabase();

    // Query semua loans
    const { data: loans, error } = await this.supabaseService
      .from('loans')
      .select('item_id, quantity, items(id, name, code, image_url, categories(name))');

    if (error) {
      throw new BadRequestException(error.message);
    }

    const counts: Record<string, { item: any; totalBorrowCount: number; totalQuantityBorrowed: number }> = {};

    (loans || []).forEach((l) => {
      if (!l.items) return;
      const itemId = l.item_id;
      if (!counts[itemId]) {
        counts[itemId] = {
          item: l.items,
          totalBorrowCount: 0,
          totalQuantityBorrowed: 0,
        };
      }
      counts[itemId].totalBorrowCount += 1;
      counts[itemId].totalQuantityBorrowed += l.quantity || 1;
    });

    const sorted = Object.values(counts)
      .sort((a, b) => b.totalBorrowCount - a.totalBorrowCount)
      .slice(0, limit);

    return sorted;
  }

  async getOverdueReport() {
    this.checkSupabase();

    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await this.supabaseService
      .from('loans')
      .select('*, items(id, name, code), users(id, name, email, class_name, phone)')
      .eq('status', LoanStatus.BORROWED)
      .lt('due_date', today)
      .order('due_date', { ascending: true });

    if (error) {
      throw new BadRequestException(error.message);
    }

    const enhanced = (data || []).map((loan) => {
      const now = new Date();
      const returnDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dueParts = loan.due_date.split('-');
      const dueDay = new Date(parseInt(dueParts[0], 10), parseInt(dueParts[1], 10) - 1, parseInt(dueParts[2], 10));
      const diffMs = returnDay.getTime() - dueDay.getTime();
      const daysOverdue = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;

      return {
        ...loan,
        daysOverdue,
      };
    });

    return {
      totalOverdue: enhanced.length,
      records: enhanced,
    };
  }
}
