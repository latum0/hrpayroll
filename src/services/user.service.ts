import { ServiceResponse } from "../types/service";
import { CreateUserDto, UpdateUserDto, UserResponseDto } from "../dtos/user.dto";
import { prisma } from "../config/database";
import bcrypt from "bcrypt";
import { PrismaClientKnownRequestError } from "../../generated/prisma/runtime/library";
import { ConflictError } from "../utils/errors";
import { ensureExists, ensureUnique, stripNullish } from "../utils/helper";
import { Prisma, Users } from "../../generated/prisma";
import { createHistoryService } from "./history.service";

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


export async function updateUserService(userId: number, dto: UpdateUserDto): Promise<ServiceResponse<UserResponseDto>> {
    try {

        await ensureExists(() => prisma.users.findUnique({ where: { id: userId } }), "User");
        const strippedDto = stripNullish(dto)
        const updatedUser = await prisma.$transaction(async tx => {
            const user = await tx.users.update({ where: { id: userId }, data: { ...strippedDto } });
            await createHistoryService(tx, userId, "User update")
            return user;
        })
        const { password, refreshToken, ...userResponse } = updatedUser;

        return { statusCode: 200, data: userResponse, message: "User updated." }

    } catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            const field = Array.isArray(err.meta?.target) ? err.meta.target[0] : err.meta?.target;
            throw new ConflictError("User", field as string);
        }
        throw err;

    }

}



