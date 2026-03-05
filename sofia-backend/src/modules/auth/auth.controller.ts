import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TokenResponseDto } from './dtos/token-response.dto';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login user and get tokens' })
    @ApiResponse({ status: 200, description: 'Successful login', type: TokenResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(@Body() loginDto: LoginDto, @Request() req: any) {
        // Audit data
        const ip = req.ip;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const correlationId = req.headers['x-correlation-id'] || uuidv4();

        return this.authService.login(loginDto.employeeCode, loginDto.password, ip, userAgent, correlationId);
    }

    @Public()
    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Token refreshed', type: TokenResponseDto })
    async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto.refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('logout')
    @ApiOperation({ summary: 'Logout and revoke all refresh tokens' })
    @ApiResponse({ status: 200, description: 'Logged out successfully' })
    async logout(@CurrentUser() user: any) {
        await this.authService.logout(user.id);
        return { message: 'Logged out successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    async getProfile(@CurrentUser() user: any) {
        return this.authService.getProfile(user.id);
    }
}
