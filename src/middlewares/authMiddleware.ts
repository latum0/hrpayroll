import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/tokens";
import { UnauthorizedError } from "../utils/errors";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        let token: string | undefined;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            throw new UnauthorizedError("No token provided");
        }

        const decoded = verifyAccessToken(token) as any;

        req.user = {
            id: decoded.sub,
            sub: decoded.sub,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role.name,
            permissions: decoded.permissions || [],
        };

        next();
    } catch (err) {
        next(new UnauthorizedError("Invalid or expired token"));
    }
}
