import type { Role, UserPermission } from '../../../generated/prisma';

declare global {
    namespace Express {
        interface Users {
            id: number;
            sub: number;
            email: string;
            role: Role;
            userPermissions?: UserPermission[];
        }

        interface Request {
            user?: Users;
        }
    }
}