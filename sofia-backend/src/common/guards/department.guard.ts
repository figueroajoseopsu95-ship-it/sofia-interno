import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DEPARTMENTS_KEY } from '../decorators/department.decorator';
import { DepartmentCode } from '../constants/departments.constant';

@Injectable()
export class DepartmentGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredDepartments = this.reflector.getAllAndOverride<DepartmentCode[]>(DEPARTMENTS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredDepartments) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.departments || user.departments.length === 0) {
            throw new ForbiddenException('User department not found');
        }

        // Checking if user has any of the required departments
        const userDepCodes = user.departments.map((d: any) => d.code);
        const hasDepartment = requiredDepartments.some((code) => userDepCodes.includes(code));

        if (!hasDepartment) {
            throw new ForbiddenException(`Require one of these departments: ${requiredDepartments.join(', ')}`);
        }

        return true;
    }
}
