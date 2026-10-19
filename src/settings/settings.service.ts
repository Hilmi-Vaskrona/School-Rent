import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SettingsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private checkSupabase() {
    if (!this.supabaseService.isReady) {
      throw new BadRequestException('Supabase belum terhubung.');
    }
  }

  async getAll() {
    this.checkSupabase();

    const { data, error } = await this.supabaseService
      .from('system_settings')
      .select('*')
      .order('key', { ascending: true });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data || [];
  }

  async getByKey(key: string, defaultValue = ''): Promise<string> {
    if (!this.supabaseService.isReady) return defaultValue;

    const { data } = await this.supabaseService
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    return data?.value || defaultValue;
  }

  async update(key: string, value: string) {
    this.checkSupabase();

    const { data, error } = await this.supabaseService
      .from('system_settings')
      .upsert({ key, value: String(value) }, { onConflict: 'key' })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Gagal memperbarui konfigurasi: ' + error.message);
    }

    return {
      message: `Konfigurasi '${key}' berhasil diperbarui`,
      data,
    };
  }
}
