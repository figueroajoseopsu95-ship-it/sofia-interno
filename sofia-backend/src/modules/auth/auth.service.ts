import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service';
import { TokenResponseDto } from './dtos/token-response.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    // Used by LocalStrategy optionally, but here we keep logic directly inside login() 
    // to better track failed attempts directly with IP/Auditing
    async validateUser(employeeCode: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({ where: { employeeCode } });
        if (user && user.status === 'active' && await bcrypt.compare(pass, user.passwordHash)) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(employeeCode: string, pass: string, ip: string, userAgent: string, correlationId: string): Promise<TokenResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { employeeCode },
            include: {
                departments: {
                    include: { department: true }
                }
            }
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.status !== 'active') {
            throw new ForbiddenException(`User is ${user.status}`);
        }

        const isMatch = await bcrypt.compare(pass, user.passwordHash);

        if (!isMatch) {
            await this.handleFailedLogin(user, ip, correlationId);
        }

        // Reset failed attempts & update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: 0,
                lastLoginAt: new Date(),
            },
        });

        // Logging audit success
        await this.prisma.auditLog.create({
            data: {
                correlationId,
                userId: user.id,
                action: 'LOGIN_SUCCESS',
                ipAddress: ip,
                userAgent,
                result: 'success',
            },
        });

        return this.generateTokens(user);
    }

    async refreshToken(refreshToken: string): Promise<TokenResponseDto> {
        try {
            // Decode JWT simply to get userId and un-hashed jti
            const decoded: any = this.jwtService.decode(refreshToken);
            if (!decoded || !decoded.sub || !decoded.jti) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Verify signature
            this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            const user = await this.prisma.user.findUnique({
                where: { id: decoded.sub },
                include: { departments: { include: { department: true } } }
            });

            if (!user || user.status !== 'active') {
                throw new UnauthorizedException('User inactive or not found');
            }

            // Fetch all valid refresh tokens for this user
            const dbTokens = await this.prisma.refreshToken.findMany({
                where: {
                    userId: user.id,
                    isRevoked: false,
                    expiresAt: { gt: new Date() }
                }
            });

            let validTokenFound = false;
            let tokenIdToRemove = null;

            for (const tokenRecord of dbTokens) {
                if (await bcrypt.compare(refreshToken, tokenRecord.tokenHash)) {
                    validTokenFound = true;
                    tokenIdToRemove = tokenRecord.id;
                    break;
                }
            }

            if (!validTokenFound) {
                throw new UnauthorizedException('Refresh token is invalid or revoked');
            }

            // Revoke the old token (rotation)
            await this.prisma.refreshToken.delete({ where: { id: tokenIdToRemove as string } });

            return this.generateTokens(user);

        } catch (error) {
            throw new UnauthorizedException((error as any).message || 'Invalid refresh token');
        }
    }

    async logout(userId: string): Promise<void> {
        await this.prisma.refreshToken.updateMany({
            where: { userId },
            data: { isRevoked: true },
        });
    }

    async getProfile(userId: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                employeeCode: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                status: true,
                lastLoginAt: true,
                departments: {
                    select: {
                        isPrimary: true,
                        department: {
                            select: { id: true, code: true, name: true }
                        }
                    }
                }
            }
        });

        if (!user) {
            throw new UnauthorizedException('Profile not found');
        }

        return user;
    }

    // --- Helpers ---

    private async generateTokens(user: any): Promise<TokenResponseDto> {
        const payload = { sub: user.id, role: user.role };
        const jti = uuidv4();

        const expiresInString = this.configService.get<string>('JWT_EXPIRES_IN', '15m');
        const expiresInSeconds = this.parseExpiresInToSeconds(expiresInString);

        const accessToken = this.jwtService.sign(payload);

        // Refresh token expiry 7 days
        const refreshToken = this.jwtService.sign(
            { sub: user.id, role: user.role, jti },
            { expiresIn: '7d' }
        );

        // Hash refresh token for DB
        const tokenHash = await bcrypt.hash(refreshToken, 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
            },
        });

        const mappedDepartments = user.departments?.map((d: any) => ({
            id: d.department.id,
            name: d.department.name,
            code: d.department.code,
            isPrimary: d.isPrimary
        })) || [];

        return {
            accessToken,
            refreshToken,
            expiresIn: expiresInSeconds,
            user: {
                id: user.id,
                employeeCode: user.employeeCode,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                status: user.status,
                departments: mappedDepartments,
            },
        };
    }

    private async handleFailedLogin(user: any, ip: string, correlationId: string) {
        const maxAttempts = 5;
        const newAttempts = user.failedLoginAttempts + 1;

        let updateData: any = { failedLoginAttempts: newAttempts };

        // Bloqueo automatico
        if (newAttempts >= maxAttempts) {
            updateData.status = 'blocked';

            // Registrar evento de seguridad
            await this.prisma.securityEvent.create({
                data: {
                    severity: 'high',
                    eventType: 'ACCOUNT_BLOCKED',
                    title: 'Multiple failed login attempts',
                    description: `User ${user.employeeCode} blocked after ${maxAttempts} failed attempts.`,
                    userId: user.id,
                    ipAddress: ip,
                }
            });
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: updateData,
        });

        await this.prisma.auditLog.create({
            data: {
                correlationId,
                userId: user.id,
                action: 'LOGIN_FAILED',
                ipAddress: ip,
                result: 'failure',
                errorMessage: 'Invalid password',
            },
        });

        throw new UnauthorizedException('Invalid credentials');
    }

    private parseExpiresInToSeconds(expiresIn: string): number {
        if (expiresIn.endsWith('m')) return parseInt(expiresIn) * 60;
        if (expiresIn.endsWith('h')) return parseInt(expiresIn) * 3600;
        if (expiresIn.endsWith('d')) return parseInt(expiresIn) * 86400;
        return parseInt(expiresIn) || 900;
    }
}
