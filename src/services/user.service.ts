import { ServiceResponse } from "../types/service";
import { CreateUserDto, UpdateUserDto, UserListResponseDto, UserResponseDto } from "../dtos/user.dto";
import { prisma } from "../config/database";
import bcrypt from "bcrypt";
import { PrismaClientKnownRequestError } from "../../generated/prisma/runtime/library";
import { ConflictError, NotFoundError } from "../utils/errors";
import { ensureExists, stripNullish } from "../utils/helper";
import { Prisma, } from "../../generated/prisma";
import { createHistoryService } from "./history.service";

export async function createUserService(
    userData: CreateUserDto,
    acteurId: number,
    acteur: string): Promise<ServiceResponse<UserResponseDto>> {
    try {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const createdUser = await prisma.$transaction(async (tx) => {
            const user = await tx.users.create({
                data: {
                    email: userData.email,
                    name: userData.name,
                    password: hashedPassword,
                    phone: userData.phone,
                    role: { connect: { id: userData.roleId } },
                },
            });


            await createHistoryService(tx, acteurId, acteur, `Created user ${userData.name} (ID=${user.id})`);

            return user;
        });


        const { password, refreshToken, ...userResponse } = createdUser;
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


export async function updateUserService(userId: number, dto: UpdateUserDto, acteurId: number, acteur: string,): Promise<ServiceResponse<UserResponseDto>> {
    try {

        const user = await ensureExists(() => prisma.users.findUnique({ where: { id: userId } }), "User");
        const strippedDto = stripNullish(dto)
        const updatedUser = await prisma.$transaction(async tx => {
            const user = await tx.users.update({ where: { id: userId }, data: { ...strippedDto } });
            await createHistoryService(tx, acteurId, acteur, `Updated user ${user.name ?? "(no name)"} (ID=${user.id})`)
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



export async function getUserByIdService(userId: number): Promise<ServiceResponse<UserResponseDto>> {
    try {

        await ensureExists(() => prisma.users.findUnique({ where: { id: userId } }), "User");

        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: {
                role: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                }
            }
        });


        if (!user) {

            throw new Error("User not found");
        }


        const { password, refreshToken, ...userResponse } = user;

        return { statusCode: 200, data: userResponse as UserResponseDto, message: "User fetched." };

    } catch (err) {
        throw err;
    }
}



export async function getUsersService(options?: {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: number;
    sortBy?: string;
    order?: "asc" | "desc";
}): Promise<ServiceResponse<UserListResponseDto>> {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            roleId,
            sortBy = "createdAt",
            order = "desc"
        } = options ?? {};

        // sanitize pagination
        const safePage = Math.max(1, Math.floor(Number(page) || 1));
        const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)));
        const skip = (safePage - 1) * safeLimit;

        // only allow sorting by a safe whitelist to avoid arbitrary SQL injection via field name
        const allowedSortFields = ["id", "email", "name", "createdAt", "updatedAt"];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
        const sortOrder = order === "asc" ? "asc" : "desc";

        // build where clause
        const where: any = {};
        if (search && String(search).trim().length > 0) {
            const q = String(search).trim();
            where.OR = [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { phone: { contains: q, mode: "insensitive" } }
            ];
        }
        if (typeof roleId === "number") {
            where.roleId = roleId;
        }

        // run count + page query concurrently for performance
        const [total, users] = await Promise.all([
            prisma.users.count({ where }),
            prisma.users.findMany({
                where,
                include: {
                    role: {
                        select: {
                            id: true,
                            name: true,
                            description: true
                        }
                    }
                },
                orderBy: { [sortField]: sortOrder },
                skip,
                take: safeLimit
            })
        ]);

        // sanitize results
        const sanitized = users.map(u => {
            const { password, refreshToken, ...rest } = u;
            return rest as UserResponseDto;
        });

        const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);

        const result: UserListResponseDto = {
            users: sanitized,
            total,
            page: safePage,
            limit: safeLimit,
            totalPages
        };

        return { statusCode: 200, data: result, message: "Users fetched." };

    } catch (err) {
        throw err;
    }
}




export async function deleteUserService(userId: number, id: number, acteur: string): Promise<ServiceResponse<UserResponseDto>> {
    try {
        await ensureExists(() => prisma.users.findUnique({ where: { id: userId } }), "User");

        const deletedUser = await prisma.$transaction(async (tx) => {
            await tx.historique.deleteMany({ where: { userId } })
            const user = await tx.users.delete({
                where: { id: userId }
            });
            await createHistoryService(tx, id, acteur, `Deleted user (ID=${userId})`);

            return user;
        });

        const { password, refreshToken, ...userResponse } = deletedUser;

        return { statusCode: 200, data: userResponse as UserResponseDto, message: "User deleted." };

    } catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025") {
                throw new NotFoundError("User not found");
            }
        }
        throw err;
    }
}

