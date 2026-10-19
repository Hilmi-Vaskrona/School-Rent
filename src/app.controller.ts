import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/roles.decorator';

@ApiTags('Root')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Status API' })
  getHome() {
    return {
      success: true,
      message: '🚀 SchoolRent Backend API is running smoothly on Vercel!',
      docs: '/api/docs',
      endpoints: {
        auth_login: '/api/auth/login',
        auth_register: '/api/auth/register',
        items: '/api/items',
        categories: '/api/categories',
        loans: '/api/loans',
        returns: '/api/returns',
        fines: '/api/fines',
        dashboard: '/api/dashboard/stats',
        reports: '/api/reports/statistics',
      },
    };
  }
}
