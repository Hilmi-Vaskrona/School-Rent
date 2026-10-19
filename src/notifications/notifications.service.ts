import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private checkSupabase() {
    if (!this.supabaseService.isReady) {
      throw new BadRequestException('Supabase belum terhubung.');
    }
  }

  async create(userId: string, title: string, message: string, type = 'INFO', referenceId?: string) {
    if (!this.supabaseService.isReady) {
      this.logger.warn(`Notifikasi tidak dapat disimpan ke DB (Supabase belum ready): [${type}] ${title}`);
      return null;
    }

    try {
      const { data, error } = await this.supabaseService
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          reference_id: referenceId || null,
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Gagal membuat notifikasi:', error);
      }
      return data;
    } catch (err) {
      this.logger.error('Error saat membuat notifikasi:', err);
      return null;
    }
  }

  async findAllForUser(userId: string) {
    this.checkSupabase();

    const { data, error } = await this.supabaseService
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new BadRequestException(error.message);
    }

    const unreadCount = data?.filter((n) => !n.is_read).length || 0;

    return {
      unreadCount,
      notifications: data || [],
    };
  }

  async markAsRead(id: string, userId: string) {
    this.checkSupabase();

    const { data, error } = await this.supabaseService
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Gagal menandai notifikasi dibaca: ' + error.message);
    }

    return {
      message: 'Notifikasi berhasil ditandai telah dibaca',
      data,
    };
  }

  async markAllAsRead(userId: string) {
    this.checkSupabase();

    const { error } = await this.supabaseService
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new BadRequestException('Gagal menandai semua notifikasi: ' + error.message);
    }

    return {
      message: 'Semua notifikasi berhasil ditandai telah dibaca',
    };
  }
}
