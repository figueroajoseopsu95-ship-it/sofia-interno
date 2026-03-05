import { SetMetadata } from '@nestjs/common';
import { DepartmentCode } from '../constants/departments.constant';

export const DEPARTMENTS_KEY = 'departments';
export const Department = (...codes: DepartmentCode[]) => SetMetadata(DEPARTMENTS_KEY, codes);
