// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/tokens"; // your verifier
import { UnauthorizedError } from "../utils/errors";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        // allow OPTIONS preflight through without auth
        if (req.method === "OPTIONS") {
            return next();
        }

        let token: string | undefined;
        const authHeader = req.headers.authorization;
        if (authHeader && typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.cookies && typeof req.cookies.accessToken === "string" && req.cookies.accessToken.length > 0) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            throw new UnauthorizedError("No token provided");
        }

        console.log("[authMiddleware] token present, verifying...");

        const decoded = verifyAccessToken(token) as any; 
        console.log("[authMiddleware] decoded:", decoded);

        req.user = {
            id: decoded.sub ?? decoded.id,
            sub: decoded.sub ?? decoded.id,
            firstName: decoded.firstName ?? decoded.given_name ?? null,
            lastName: decoded.lastName ?? decoded.family_name ?? null,
            email: decoded.email,
            role: decoded.role, 
            permissions: decoded.permissions ?? [],
        };

        return next();
    } catch (err: any) {
        console.error("[authMiddleware] verify error:", err && err.message ? err.message : err);
        return next(new UnauthorizedError(err?.message ?? "Invalid or expired token"));
    }
}
