import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/errors";


export function requirePermission(...needed: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ForbiddenError("Not authenticated"));
        }

        const userPerms: string[] = req.user.permissions || [];
        const hasAll = needed.every(p => userPerms.includes(p));
        if (!hasAll) {
            return next(new ForbiddenError("Insufficient permissions"));
        }
        next();
    };
}

export function requireRole(...allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ForbiddenError("Not authenticated"));
        }

        const roleName = typeof req.user.role === 'string'
            ? req.user.role
            : req.user.role.name;

        if (!allowedRoles.includes(roleName)) {
            return next(new ForbiddenError("Role not allowed"));
        }
        next();
    };
}

export function requireRoleOrOwner(...allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ForbiddenError("Not authenticated"));
        }

    }

}
