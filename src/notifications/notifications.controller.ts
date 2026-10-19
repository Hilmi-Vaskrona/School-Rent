import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar notifikasi pengguna yang login' })
  async findAll(@GetUser('id') userId: string) {
    return this.notificationsService.findAllForUser(userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Menandai semua notifikasi pengguna sebagai telah dibaca' })
  async markAllAsRead(@GetUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Menandai 1 notifikasi sebagai telah dibaca' })
  async markAsRead(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.notificationsService.markAsRead(id, userId);
  }
}
