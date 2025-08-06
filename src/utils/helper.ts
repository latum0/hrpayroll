import bcrypt from "bcrypt";
import { NotFoundError } from "./errors";

export async function hashPassword(password: string) {
    await bcrypt.hash(password, 10);
}

export const checkPassword = async (userPassword: string, hashedPassword: string) => {
    const check = await bcrypt.compare(userPassword, hashedPassword)
    if (!check) {
        throw new Error("email or password is invalid")
    }
}


export async function ensureExists<T>(fn: () => Promise<T>, entity: string) {
    const exists = await fn();
    if (!exists) {
        throw new NotFoundError(`${entity} not found`);
    }
}

