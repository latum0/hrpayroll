import prisma from '../config/database';
import { CreateBankAccountDto, UpdateBankAccountDto } from '../dtos/bankAccount.dto';
import { ServiceResponse } from '../types/service';
import { computeHmacHex, encryptPlaintext, maskIban, normalizeIban } from '../utils/crypto';
import { ensureExists, ensureUnique } from '../utils/helper';
import { createHistoryService } from './history.service';
import { toBankAccountResponseDto } from '../utils/responseHelpers';
import { BankAccountListResponseDto, BankAccountResponseDto } from '../dtos/reponses.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConflictError } from '../utils/errors';

export async function createBankAccountService(
    dto: CreateBankAccountDto,
    actorId: number,
    actor: string
): Promise<ServiceResponse<any>> {
    try {
        await ensureExists(
            () => prisma.employee.findUnique({ where: { id: dto.employeeId } }),
            'Employee'
        );
        await ensureUnique(
            () => prisma.employeeBankAccount.findFirst({ where: { employeeId: dto.employeeId } }),
            'Bank account'
        );

        let normalizedIban: string | undefined;
        let ibanHash: string | undefined;
        if (dto.iban) {
            normalizedIban = normalizeIban(dto.iban);
            ibanHash = computeHmacHex(normalizedIban);

            await ensureUnique(
                () => prisma.employeeBankAccount.findFirst({ where: { ibanHash } }),
                'Bank account'
            );
        }

        if (dto.rip) {
            await ensureUnique(
                () => prisma.employeeBankAccount.findUnique({ where: { rip: dto.rip } }),
                'Bank account.'
            );
        }

        if (dto.ccpAccountNumber) {
            await ensureUnique(
                () =>
                    prisma.employeeBankAccount.findFirst({
                        where: { ccpAccountNumber: dto.ccpAccountNumber, ccpKey: dto.ccpKey },
                    }),
                'Bank account.'
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            const data: any = {
                employeeId: dto.employeeId,
                accountHolderName: dto.accountHolderName,
                bic: dto.bic,
                bankName: dto.bankName,
                ccpAccountNumber: dto.ccpAccountNumber,
                ccpKey: dto.ccpKey,
                rip: dto.rip,
            };

            if (normalizedIban && ibanHash) {
                const { ciphertext, iv, tag } = encryptPlaintext(normalizedIban);
                data.ibanCiphertext = ciphertext;
                data.ibanIv = iv;
                data.ibanTag = tag;
                data.ibanMasked = maskIban(normalizedIban);
                data.ibanLast4 = normalizedIban.slice(-4);
                data.ibanHash = ibanHash;
            }

            const bankAccount = await tx.employeeBankAccount.create({
                data,
                include: {
                    employee: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
            });

            await createHistoryService(tx, actorId, actor, 'Bank account created.');

            const safeResult = { ...bankAccount } as any;
            delete safeResult.ibanCiphertext;
            delete safeResult.ibanIv;
            delete safeResult.ibanTag;
            delete safeResult.ibanHash;
            delete safeResult.ccpKey;

            return safeResult;
        });

        return {
            statusCode: 201,
            data: result,
            message: 'Bank account created successfully',
        };
    } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
            const field = Array.isArray(err.meta?.target) ? err.meta.target[0] : err.meta?.target;
            throw new ConflictError("Bank account", field as string);
        }
        throw err;
    }
}

export async function getBankAccountByIdService(id: number): Promise<ServiceResponse<BankAccountResponseDto>> {

    const acc = await ensureExists(() => prisma.employeeBankAccount.findUnique({ where: { id }, include: { employee: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } } }), "Bank account")

    const payload = toBankAccountResponseDto(acc);
    return { statusCode: 200, data: payload, message: 'Bank account fetched.' };
}

export async function getBankAccountsService(options?: { page?: number; limit?: number; search?: string; employeeId?: number; sortBy?: string; order?: string }): Promise<ServiceResponse<BankAccountListResponseDto>> {
    const { page = 1, limit = 10, search, employeeId, sortBy = 'id', order = 'asc' } = options ?? {};

    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)));
    const skip = (safePage - 1) * safeLimit;

    const allowedSortFields = ['id', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    const sortOrder = order === 'desc' ? 'desc' : 'asc';

    const where: any = {};
    if (typeof employeeId === 'number') where.employeeId = employeeId;

    if (search && String(search).trim().length > 0) {
        const q = String(search).trim();
        where.OR = [
            { rip: { contains: q } },
            { accountHolderName: { contains: q } },
            { employee: { user: { firstName: { contains: q } } } },
            { employee: { user: { lastName: { contains: q } } } },
            { employee: { user: { email: { contains: q } } } },
        ];
    }

    const [total, rows] = await Promise.all([
        prisma.employeeBankAccount.count({ where }),
        prisma.employeeBankAccount.findMany({ where, include: { employee: { include: { user: true } } }, orderBy: { [sortField]: sortOrder }, skip, take: safeLimit }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);
    const mapped = rows.map((r) => toBankAccountResponseDto(r));

    const result: BankAccountListResponseDto = {
        bankAccounts: mapped,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
    };

    return { statusCode: 200, data: result, message: 'Bank accounts fetched.' };
}

export async function updateBankAccountService(id: number, dto: UpdateBankAccountDto, actorId: number, actor: string): Promise<ServiceResponse<BankAccountResponseDto>> {
    const existing = await ensureExists(() => prisma.employeeBankAccount.findUnique({ where: { id } }), 'Bank account');

    const data: any = {};

    if (dto.employeeId !== undefined && dto.employeeId !== existing.employeeId) {
        await ensureExists(() => prisma.employee.findUnique({ where: { id: dto.employeeId } }), 'Employee');
        await ensureUnique(() => prisma.employeeBankAccount.findFirst({ where: { employeeId: dto.employeeId } }), 'Bank account for employee');
        data.employeeId = dto.employeeId;
    }

    if (dto.accountHolderName !== undefined) data.accountHolderName = dto.accountHolderName ?? null;

    // IBAN handling: normalize, hash, encrypt if provided
    let normalizedIban: string | undefined;
    let ibanHash: string | undefined;
    if (dto.iban !== undefined) {
        if (dto.iban === null) {
            data.ibanCiphertext = null;
            data.ibanIv = null;
            data.ibanTag = null;
            data.ibanMasked = null;
            data.ibanLast4 = null;
            data.ibanHash = null;
        } else {
            normalizedIban = normalizeIban(dto.iban);
            ibanHash = computeHmacHex(normalizedIban);
            await ensureUnique(() => prisma.employeeBankAccount.findFirst({ where: { iban: ibanHash, NOT: { id } } }), 'Bank account.');
            const { ciphertext, iv, tag } = encryptPlaintext(normalizedIban);
            data.ibanCiphertext = ciphertext;
            data.ibanIv = iv;
            data.ibanTag = tag;
            data.ibanMasked = maskIban(normalizedIban);
            data.ibanLast4 = normalizedIban.slice(-4);
            data.ibanHash = ibanHash;
        }
    }

    if (dto.bic !== undefined) data.bic = dto.bic ?? null;
    if (dto.bankName !== undefined) data.bankName = dto.bankName ?? null;

    if (dto.ccpAccountNumber !== undefined) {
        if (dto.ccpAccountNumber === null) {
            data.ccpAccountNumber = null;
            data.ccpKey = null;
        } else {
            await ensureUnique(() => prisma.employeeBankAccount.findFirst({ where: { ccpAccountNumber: dto.ccpAccountNumber, ccpKey: dto.ccpKey, NOT: { id } } }), 'Bank account.');
            data.ccpAccountNumber = dto.ccpAccountNumber;
            data.ccpKey = dto.ccpKey ?? null;
        }
    }

    if (dto.rip !== undefined) {
        if (dto.rip === null) {
            data.rip = null;
        } else {

            await ensureUnique(() => prisma.employeeBankAccount.findFirst({ where: { rip: dto.rip } }), 'Bank account.');
            data.rip = dto.rip;
        }
    }

    const updated = await prisma.$transaction(async (tx) => {
        const up = await tx.employeeBankAccount.update({ where: { id }, data, include: { employee: { include: { user: true } } } });
        await createHistoryService(tx, actorId, actor, `Updated bank account ID=${id}`);

        const safe = { ...up } as any;
        delete safe.ibanCiphertext;
        delete safe.ibanIv;
        delete safe.ibanTag;
        delete safe.ibanHash;
        delete safe.ccpKey;
        return safe;
    });

    const payload = toBankAccountResponseDto(updated);
    return { statusCode: 200, data: payload, message: 'Bank account updated.' };
}

export async function deleteBankAccountService(id: number, actorId: number, actor: string): Promise<ServiceResponse<void>> {
    await ensureExists(() => prisma.employeeBankAccount.findUnique({ where: { id } }), 'Bank account');

    await prisma.$transaction(async (tx) => {
        await tx.employeeBankAccount.delete({ where: { id } });
        await createHistoryService(tx, actorId, actor, `Deleted bank account ID=${id}`);
    });

    return { statusCode: 200, message: 'Bank account deleted.' };
}
