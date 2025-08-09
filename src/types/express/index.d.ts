import type { Role, UserPermission } from '../../../generated/prisma';

declare global {
    namespace Express {
        interface Users {
            id: number;
            sub: number;
            name: string;
            email: string;
            role: Role;
            permissions?: permissions[];
        }

        interface Request {
            user?: Users;
        }
    }
}