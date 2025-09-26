import { Type, Transform } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";
import { AbsenceType } from "../../generated/prisma";

export class CreateAbsenceDto {
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    employeeId!: number;

    @IsDateString()
    @IsNotEmpty()
    date!: string;

    @IsOptional()
    @IsEnum(AbsenceType)
    type?: AbsenceType;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: "hours must be a number" })
    hours?: number;

    @IsOptional()
    @IsInt()
    leaveRequestId?: number | null;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    reason?: string | null;

    @IsOptional()
    @IsInt()
    payrollRunId?: number | null;
}

export class UpdateAbsenceDto {
    @IsOptional()
    @IsInt()
    employeeId?: number;

    @IsOptional()
    @IsDateString()
    date?: string;

    @IsOptional()
    @IsEnum(AbsenceType)
    type?: AbsenceType | null;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: "hours must be a number" })
    hours?: number | null;

    @IsOptional()
    @IsInt()
    leaveRequestId?: number | null;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    reason?: string | null;

    @IsOptional()
    @IsInt()
    payrollRunId?: number | null;
}

