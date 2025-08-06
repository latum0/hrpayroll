import { ServiceResponse } from "../types/service";
import { CreateUserDto, UpdateUserDto, UserResponseDto } from "../dtos/user.dto";
import { prisma } from "../config/database";
import bcrypt from "bcrypt";
import { PrismaClientKnownRequestError } from "../../generated/prisma/runtime/library";
import { ConflictError } from "../utils/errors";

export async function createUserService(userData: CreateUserDto): Promise<ServiceResponse<UserResponseDto>> {
    try {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await prisma.users.create({
            data: {
                email: userData.email,
                name: userData.name,
                password: hashedPassword,
                phone: userData.phone,
                role: { connect: { id: userData.roleId } }
            }
        })

        const { password, refreshToken, ...userResponse } = user;
        return { statusCode: 201, data: userResponse as UserResponseDto, message: "user created" }

    } catch (err) {
        if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
            const field = Array.isArray(err.meta?.target)
                ? err.meta.target[0]
                : err.meta?.target;
            throw new ConflictError("User", field as string);
        }
        throw err;
    }
}