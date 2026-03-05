import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: any) {
        const { sub: userId } = payload;

        // Quick DB check to ensure user isn't blocked / deleted
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, status: true, employeeCode: true, departments: { include: { department: true } } }
        });

        if (!user) {
            throw new UnauthorizedException('User no longer exists');
        }

        if (user.status !== 'active') {
            throw new UnauthorizedException(`User is ${user.status}`);
        }

        return {
            id: user.id,
            employeeCode: user.employeeCode,
            role: user.role,
            status: user.status,
            departments: user.departments
        };
    }
}
