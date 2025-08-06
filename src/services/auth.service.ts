import { LoginDto } from "../dtos/user.dto";
import bcrypt, { compare } from "bcrypt";
import { prisma } from "../config/database";
import { ServiceResponse } from "../types/service";
import { checkPassword, ensureExists } from "../utils/helper";
import { generateTokens, verifyRefreshToken } from "../utils/tokens";
import { NotFoundError } from "../utils/errors";
import { ValidationError } from "../utils/errors";

interface TokenPayload {
    sub: number;
    email: string;
    role: { id: number; name: string };
    permissions: string[];
    jti: string;
}

async function fetchUserWithPermissionsByEmail(email: string) {
    const user = await prisma.users.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            password: true,
            refreshToken: true,
            role: {
                select: {
                    id: true,
                    name: true,
                    rolePermissions: {
                        select: { permission: { select: { name: true } } }
                    }
                }
            },
            userPermissions: {
                select: { permission: { select: { name: true } } }
            }
        }
    });

    if (!user) throw new NotFoundError('User');

    const rolePerms = user.role.rolePermissions.map(rp => rp.permission.name);
    const userPerms = user.userPermissions.map(up => up.permission.name);
    const permissions = Array.from(new Set([...rolePerms, ...userPerms]));

    return { user, permissions };
}

function buildPayload(userId: number, email: string, role: { id: number; name: string }, permissions: string[]): TokenPayload {
    return {
        sub: userId,
        email,
        role,
        permissions,
        jti: crypto.randomUUID()
    };
}



export async function loginService(userEmail: string, password: string) {
    const { user, permissions } = await fetchUserWithPermissionsByEmail(userEmail);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedError('Invalid credentials');

    const payload = buildPayload(user.id, user.email, { id: user.role.id, name: user.role.name }, permissions);
    const { accessToken, refreshToken } = generateTokens(payload);

    const hashedRefresh = await bcrypt.hash(refreshToken, 12);
    await prisma.users.update({ where: { id: user.id }, data: { refreshToken: hashedRefresh } });

    return { statusCode: 200, data: { accessToken, refreshToken } };
}

export async function refreshTokenService(oldRefreshToken: string) {
    const decoded = verifyRefreshToken(oldRefreshToken) as any;
    if (!decoded || typeof decoded.sub !== 'number') throw new ValidationError('Invalid refresh token');

    const { user, permissions } = await fetchUserWithPermissionsByEmail(decoded.sub);

    if (!user.refreshToken) throw new ValidationError('Missing refresh data');
    const valid = await bcrypt.compare(oldRefreshToken, user.refreshToken);
    if (!valid) throw new ValidationError('Refresh token mismatch');

    const payload = buildPayload(user.id, user.email, { id: user.role.id, name: user.role.name }, permissions);
    const { accessToken, refreshToken } = generateTokens(payload);

    const hashedNew = await bcrypt.hash(refreshToken, 12);
    await prisma.users.update({ where: { id: user.id }, data: { refreshToken: hashedNew } });

    return { statusCode: 200, data: { accessToken, refreshToken } };
}


