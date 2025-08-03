// prisma/seed.js
import { PrismaClient } from '../generated/prisma';
const prisma = new PrismaClient();

async function main() {
    // 1) Create Roles
    const [adminRole, managerRole] = await Promise.all([
        prisma.role.upsert({
            where: { name: 'ADMIN' },
            update: {},
            create: { name: 'ADMIN', description: 'Full access' },
        }),
        prisma.role.upsert({
            where: { name: 'MANAGER' },
            update: {},
            create: { name: 'MANAGER', description: 'Limited management rights' },
        }),
    ]);

    // 2) Create Permissions
    const permissions = ['CREATE_EMPLOYEE', 'READ_PAYROLL', 'APPROVE_LEAVE'];
    const permRecords = await Promise.all(
        permissions.map(name =>
            prisma.permission.upsert({
                where: { name },
                update: {},
                create: { name, description: `${name} permission` },
            })
        )
    );

    // 3) Assign Permissions to Roles
    await Promise.all([
        // ADMIN gets all perms
        ...permRecords.map(p =>
            prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
                update: {},
                create: { roleId: adminRole.id, permissionId: p.id }
            })
        ),
        // MANAGER gets read-only
        prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: managerRole.id,
                    permissionId: permRecords.find(p => p.name === 'READ_PAYROLL')!.id
                }
            },
            update: {},
            create: {
                roleId: managerRole.id,
                permissionId: permRecords.find(p => p.name === 'READ_PAYROLL')!.id
            }
        }),
    ]);

    console.log('✅ Seed finished');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
