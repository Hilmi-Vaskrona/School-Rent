import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient;
  private isConfigured = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      this.configService.get<string>('SUPABASE_KEY');

    if (
      !supabaseUrl ||
      !supabaseKey ||
      supabaseUrl.includes('placeholder-project') ||
      supabaseKey.includes('placeholder')
    ) {
      this.logger.warn(
        '⚠️  Supabase URL atau Key belum dikonfigurasi di file .env! Harap masukkan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY yang valid dari project Supabase Anda.',
      );
      this.isConfigured = false;
      // Inisialisasi dummy client agar app tidak crash saat boot
      this.supabaseClient = createClient(
        supabaseUrl || 'https://placeholder-project.supabase.co',
        supabaseKey || 'placeholder-key',
      );
      return;
    }

    try {
      this.supabaseClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      this.isConfigured = true;
      this.logger.log('✅ Supabase Client berhasil terinisialisasi.');
    } catch (error) {
      this.logger.error('❌ Gagal menginisialisasi Supabase Client:', error);
    }
  }

  get client(): SupabaseClient {
    return this.supabaseClient;
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  get isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Helper shortcut untuk query tabel
   */
  from(tableName: string) {
    return this.supabaseClient.from(tableName);
  }

  /**
   * Upload file ke Supabase Storage (misal bucket 'item-photos' atau 'avatars')
   */
  async uploadFile(bucket: string, path: string, file: Buffer, contentType: string) {
    const { data, error } = await this.supabaseClient.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      this.logger.error(`Error upload file ke bucket ${bucket}:`, error);
      throw error;
    }

    const { data: publicUrlData } = this.supabaseClient.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  }
}
