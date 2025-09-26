import { Type, Transform } from "class-transformer";
import {
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    Min
} from "class-validator";
import { LeaveRequestStatus, LeaveRequestType } from "../../generated/prisma";


export class CreateLeaveRequestDto {
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    employeeId!: number;

    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @IsPositive()
    departmentId?: number;

    @IsDateString({}, { message: "startDate must be a valid ISO 8601 date string" })
    @IsNotEmpty()
    startDate!: string;

    @IsDateString({}, { message: "endDate must be a valid ISO 8601 date string" })
    @IsNotEmpty()
    endDate!: string;

    @IsEnum(LeaveRequestType, { message: `type must be one of: ${Object.values(LeaveRequestType).join(", ")}` })
    type!: LeaveRequestType;

    @Type(() => Number)
    @IsOptional()
    @IsNumber({}, { message: "days must be a number" })
    @Min(0.5, { message: "days must be at least 0.5" })
    days?: number;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    reason?: string | null;

    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @IsPositive()
    payrollRunId?: number;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    payrollNote?: string | null;

}


export class UpdateLeaveRequestDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    employeeId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    departmentId?: number;

    @IsOptional()
    @IsDateString({}, { message: "startDate must be an ISO date string" })
    startDate?: string;

    @IsOptional()
    @IsDateString({}, { message: "endDate must be an ISO date string" })
    endDate?: string;

    @IsOptional()
    @IsEnum(LeaveRequestType)
    type?: LeaveRequestType;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: "days must be a number" })
    @Min(0.0, { message: "days must be >= 0" })
    days?: number | null;

    @IsOptional()
    @IsEnum(LeaveRequestStatus)
    status?: LeaveRequestStatus;

    @IsOptional()
    @IsInt()
    @IsPositive()
    approvedById?: number | null;

    @IsOptional()
    @IsDateString()
    approvedAt?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    reason?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    payrollNote?: string | null;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    payrollRunId?: number | null;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    usersId?: number | null;
}

export class LeaveRequestStatusDto {
    @IsNotEmpty()
    @IsEnum(LeaveRequestStatus)
    status!: LeaveRequestStatus
}


export class GetLeaveRequestsOptionsDto {
    page?: number;
    limit?: number;
    search?: string;
    employeeId?: number;
    departmentId?: number;
    status?: string;
    type?: string;
    sortBy?: string;
    order?: "asc" | "desc";
}