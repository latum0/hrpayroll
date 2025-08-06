import { sign, verify, Secret, SignOptions } from "jsonwebtoken";

const accessSecret: Secret = process.env.JWT_ACCESS_SECRET ?? (() => { throw new Error("JWT_ACCESS_SECRET is not defined"); })();
const refreshSecret: Secret = process.env.JWT_REFRESH_SECRET ?? (() => { throw new Error("JWT_REFRESH_SECRET is not defined"); })();
const accessExpires = (process.env.JWT_ACCESS_EXPIRES_IN ?? "1h") as SignOptions['expiresIn'];
const refreshExpires = (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as SignOptions['expiresIn'];

export const generateTokens = (payload: any) => {
    const accessToken = sign(payload, accessSecret, {
        expiresIn: accessExpires,
    });

    const refreshToken = sign(payload, refreshSecret, {
        expiresIn: refreshExpires,
    });

    return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
    verify(token, accessSecret as Secret);
}

export const verifyRefreshToken = (token: string) => {
    verify(token, refreshSecret as Secret)
}

export const verifyEmailVerificationToken = (userId: number) => {
    const emailToken = sign({ sub: userId }, accessSecret, {
        expiresIn: "1h"
    })
    return emailToken
}