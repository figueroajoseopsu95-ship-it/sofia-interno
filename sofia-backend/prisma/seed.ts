import { PrismaClient, DocumentType, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 12;
  const testPassword = 'Sofia2026!';
  const hashedPassword = await bcrypt.hash(testPassword, saltRounds);

  // Departments were seeded in init.sql, so let's find one to assign to users
  // ATC: Atencion al Cliente
  const atcDepartment = await prisma.department.findUnique({ where: { code: 'ATC' } });
  
  if (!atcDepartment) {
    console.error('No departments found. Did init.sql run properly?');
    return;
  }

  const usersData = [
    {
      employeeCode: 'EMP001',
      documentType: DocumentType.V,
      documentNumber: '10000001',
      firstName: 'Empleado',
      lastName: 'Prueba',
      email: 'employee@banesco.com',
      passwordHash: hashedPassword,
      role: UserRole.employee,
      status: UserStatus.active,
    },
    {
      employeeCode: 'SUP001',
      documentType: DocumentType.V,
      documentNumber: '10000002',
      firstName: 'Supervisor',
      lastName: 'Prueba',
      email: 'supervisor@banesco.com',
      passwordHash: hashedPassword,
      role: UserRole.supervisor,
      status: UserStatus.active,
    },
    {
      employeeCode: 'ADM001',
      documentType: DocumentType.V,
      documentNumber: '10000003',
      firstName: 'Admin',
      lastName: 'Prueba',
      email: 'admin@banesco.com',
      passwordHash: hashedPassword,
      role: UserRole.admin,
      status: UserStatus.active,
    },
    {
      employeeCode: 'SAD001',
      documentType: DocumentType.V,
      documentNumber: '10000004',
      firstName: 'SuperAdmin',
      lastName: 'Prueba',
      email: 'superadmin@banesco.com',
      passwordHash: hashedPassword,
      role: UserRole.superadmin,
      status: UserStatus.active,
    }
  ];

  for (const data of usersData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: data,
    });
    
    // Assign to department
    await prisma.userDepartment.upsert({
      where: {
        userId_departmentId: {
          userId: user.id,
          departmentId: atcDepartment.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        departmentId: atcDepartment.id,
        isPrimary: true
      }
    });

    console.log(`User seeded: ${user.email} (${user.role})`);
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
