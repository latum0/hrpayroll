import { ChangePasswordDto, CreateUserDto, LoginDto } from "../dtos/user.dto";
import bcrypt from "bcrypt";
import { prisma } from "../config/database";
import { ServiceResponse } from "../types/service";
import { checkPassword, ensureExists, ensureUnique, hashPassword } from "../utils/helper";
import { generateTokens, verifyEmailVerificationToken, verifyRefreshToken } from "../utils/tokens";
import { NotFoundError, UnauthorizedError, ConflictError } from "../utils/errors";
import { ValidationError } from "../utils/errors";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/email";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

interface TokenPayload {
    sub: number;
    email: string;
    name: string;
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
            firstName: true,
            lastName: true,
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

    const rolePerms = (user.role?.rolePermissions ?? []).map(rp => rp.permission.name);
    const userPerms = (user.userPermissions ?? []).map(up => up.permission.name);
    const permissions = Array.from(new Set([...rolePerms, ...userPerms]));

    return { user, permissions };
}

function buildPayload(userId: number, email: string, name: string, role: { id: number; name: string }, permissions: string[]): TokenPayload {
    return {
        sub: userId,
        email,
        name,
        role,
        permissions,
        jti: crypto.randomUUID()
    };
}

function displayNameFromUserRecord(u: any): string {
    return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email;
}

export async function loginService(login: LoginDto) {
    const { user, permissions } = await fetchUserWithPermissionsByEmail(login.email);

    const isMatch = await bcrypt.compare(login.password, user.password);
    if (!isMatch) throw new UnauthorizedError('Invalid credentials');

    const name = displayNameFromUserRecord(user);
    const payload = buildPayload(user.id, user.email, name, { id: user.role.id, name: user.role.name }, permissions);
    const { accessToken, refreshToken } = generateTokens(payload);

    const hashedRefresh = await bcrypt.hash(refreshToken, 12);
    await prisma.users.update({ where: { id: user.id }, data: { refreshToken: hashedRefresh } });

    return { statusCode: 200, data: { accessToken, refreshToken } };
}

export async function refreshAccessTokenService(oldRefreshToken: string) {
    const decoded = verifyRefreshToken(oldRefreshToken) as any;
    if (!decoded || typeof decoded.sub !== 'number') throw new ValidationError('Invalid refresh token');

    const { user, permissions } = await fetchUserWithPermissionsByEmail(decoded.email);

    if (!user.refreshToken) throw new ValidationError('Missing refresh data');
    const valid = await bcrypt.compare(oldRefreshToken, user.refreshToken);
    if (!valid) throw new ValidationError('Refresh token mismatch');

    const name = displayNameFromUserRecord(user);
    const payload = buildPayload(user.id, user.email, name, { id: user.role.id, name: user.role.name }, permissions);
    const { accessToken, refreshToken } = generateTokens(payload);

    const hashedNew = await bcrypt.hash(refreshToken, 12);
    await prisma.users.update({ where: { id: user.id }, data: { refreshToken: hashedNew } });

    return { statusCode: 200, data: { accessToken, refreshToken } };
}



export async function changePasswordService(
    userId: number,
    dto: ChangePasswordDto
): Promise<ServiceResponse<void>> {
    const user = await ensureExists(
        () => prisma.users.findUnique({ where: { id: userId } }),
        "User"
    );

    await checkPassword(dto.currentPassword, user.password);

    const newHashedPassword = await hashPassword(dto.newPassword);

    await prisma.users.update({
        where: { id: userId },
        data: { password: newHashedPassword },
    });

    return {
        statusCode: 200,
        message: "Mot de passe modifié avec succès",
    };
}
export const verifyEmailService = async (token: string) => {
    try {
        const raw = decodeURIComponent(String(token)).trim();
        if (!raw) {
            return { success: false, message: "Token manquant ou invalide", statusCode: 400 };
        }

        const decoded: any = jwt.verify(raw, process.env.JWT_EMAIL_SECRET!);

        if (!decoded || typeof decoded.sub !== "number" || !decoded.jti) {
            return { success: false, message: "Token invalide ou expiré", statusCode: 400 };
        }

        const incomingJtiHash = crypto.createHash("sha256").update(decoded.jti).digest("hex");

        const user = await prisma.users.findFirst({
            where: {
                id: Number(decoded.sub),
                verificationToken: incomingJtiHash,
            },
        });

        if (!user) {
            return { success: false, message: "Token invalide ou expiré", statusCode: 400 };
        }

        if (user.emailVerified) {
            return { success: false, message: "Email already confirmed", statusCode: 400 };
        }

        await prisma.users.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null,
            },
        });

        return { statusCode: 200, success: true };
    } catch (err) {
        return { success: false, message: "Token invalide ou expiré", statusCode: 400 };
    }
};



export const generateResetToken = async (
    email: string
): Promise<string | null> => {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return null;

    const token = jwt.sign({ userId: user.id }, process.env.JWT_RESET_SECRET!, {
        expiresIn: "1h",
    });

    return token;
};

export const resetPassword = async (token: string, newPassword: string) => {
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_RESET_SECRET!);
        const userId = decoded.userId;

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.users.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { success: true };
    } catch (error) {
        return { success: false, message: "Token invalid or expired" };
    }
};




export const getUserProfileService = async (userId: number) => {
    const user = await ensureExists(() => prisma.users.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
            role: true,
            userPermissions: {
                select: {
                    permission: {
                        select: { name: true }
                    }
                }
            }

        }
    }), "User")
    return {
        statusCode: 200,
        data: user,
    };
};

export async function signUpService(dto: CreateUserDto) {
    try {
        await ensureUnique(
            () =>
                prisma.users.findFirst({
                    where: {
                        OR: [{ phone: dto.phone }, { email: dto.email }],
                    },
                }),
            "User"
        );

        const hashedPassword = await hashPassword(dto.password);

        // map name -> firstName/lastName if provided
        let firstName = (dto as any).firstName;
        let lastName = (dto as any).lastName;
        if (!(firstName || lastName) && (dto as any).name) {
            const parts = String((dto as any).name).trim().split(/\s+/);
            firstName = parts.shift() || "";
            lastName = parts.length > 0 ? parts.join(" ") : "";
        }

        const user = await prisma.users.create({
            data: {
                firstName: firstName ?? "Unknown",
                lastName: lastName ?? "Unknown",
                email: dto.email,
                password: hashedPassword,
                phone: dto.phone ?? null,
                role: { connect: { id: dto.roleId } },
                emailVerified: false,
            },
        });

        const jti = crypto.randomUUID();
        const jtiHash = crypto.createHash("sha256").update(jti).digest("hex");

        await prisma.users.update({
            where: { id: user.id },
            data: {
                verificationToken: jtiHash,
            },
        });

        const verificationToken = verifyEmailVerificationToken(user.id, jti);

        // send an URL-encoded token
        await sendVerificationEmail(user.email, encodeURIComponent(verificationToken));

        const { password, refreshToken, verificationToken: _, ...userResponse } = user;

        return {
            statusCode: 201,
            data: userResponse,
            message: "User registered successfully—please check your inbox to verify your email",
        };
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
            const field = Array.isArray(err.meta?.target) ? err.meta.target[0] : err.meta?.target;
            throw new ConflictError("User", field as string);
        }
        throw err;
    }
}
