import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto, LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrasi pengguna baru (Role default: SISWA)' })
  @ApiResponse({ status: 201, description: 'Registrasi berhasil dan mengembalikan token JWT' })
  @ApiResponse({ status: 400, description: 'Data tidak valid' })
  @ApiResponse({ status: 409, description: 'Email sudah terdaftar' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login pengguna menggunakan email & password' })
  @ApiResponse({ status: 200, description: 'Login berhasil dan mengembalikan token JWT' })
  @ApiResponse({ status: 401, description: 'Email atau password salah' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Mendapatkan data profil pengguna yang sedang login' })
  @ApiResponse({ status: 200, description: 'Data profil pengguna' })
  async getProfile(@GetUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('change-password')
  @ApiOperation({ summary: 'Mengubah password pengguna' })
  @ApiResponse({ status: 200, description: 'Password berhasil diubah' })
  async changePassword(
    @GetUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }
}
