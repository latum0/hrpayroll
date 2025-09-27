import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";
import { Payfreq, PayType, ContractStatus } from "../../generated/prisma";

export class CreateContractDto {
    @IsInt()
    @IsPositive()
    employeeId!: number;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    title?: string | null;

    @IsDateString()
    @IsNotEmpty()
    startDate!: string;

    @IsOptional()
    @IsDateString()
    endDate?: string | null;

    @IsOptional()
    @IsEnum(Payfreq)
    payFrequency?: Payfreq;

    @IsOptional()
    @IsEnum(PayType)
    payType?: PayType;

    @IsOptional()
    @IsEnum(ContractStatus)
    status?: ContractStatus;
}

export class UpdateContractDto {
    @IsOptional()
    @IsInt()
    employeeId?: number;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    title?: string | null;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string | null;

    @IsOptional()
    @IsEnum(Payfreq)
    payFrequency?: Payfreq | null;

    @IsOptional()
    @IsEnum(PayType)
    payType?: PayType | null;

    @IsOptional()
    @IsEnum(ContractStatus)
    status?: ContractStatus | null;
}

