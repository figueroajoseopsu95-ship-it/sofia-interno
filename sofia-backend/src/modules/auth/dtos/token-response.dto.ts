import { UserRole, UserStatus } from '../../../common/constants/roles.constant';

export class TokenResponseDto {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
        id: string;
        employeeCode: string;
        firstName: string;
        lastName: string;
        email: string;
        role: UserRole | string;
        status: UserStatus | string;
        departments?: { id: string; name: string; code: string; isPrimary: boolean }[];
    };
}
