// dtos/employee.dto.ts
import { IsNotEmpty, IsOptional, IsString, MaxLength, IsInt, IsDateString } from "class-validator";

export class CreateEmployeeDto {
    @IsInt()
    @IsNotEmpty()
    userId!: number;

    @IsInt()
    @IsNotEmpty()
    departmentId!: number;

    @IsOptional()
    @IsDateString()
    dob?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    nationalId?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    taxId?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    jobTitle?: string;

    @IsOptional()
    @IsDateString()
    hireDate?: string;

    @IsOptional()
    @IsDateString()
    terminationDate?: string;

    @IsOptional()
    @IsInt()
    managerId?: number;
}

export class UpdateEmployeeDto {
    @IsOptional()
    @IsInt()
    departmentId?: number;

    @IsOptional()
    @IsDateString()
    dob?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    nationalId?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    taxId?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    jobTitle?: string;

    @IsOptional()
    @IsDateString()
    hireDate?: string;

    @IsOptional()
    @IsDateString()
    terminationDate?: string;

    @IsOptional()
    @IsInt()
    managerId?: number;

    @IsOptional()
    @IsString()
    status?: string; // validate in business layer if needed
}

export class EmployeeResponseDto {
    id!: number;
    user?: {
        id: number;
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string | null;
    } | null;
    dob?: Date | null;
    nationalId?: string | null;
    taxId?: string | null;
    jobTitle?: string | null;
    hireDate?: Date | null;
    terminationDate?: Date | null;
    status?: string;
    managerId?: number | null;
    department?: {
        id: number;
        name: string;
    } | null;
    createdAt?: Date;
    updatedAt?: Date;

    _count?: {
        bankAccounts?: number;
        contracts?: number;
        payslips?: number;
        leaveRequests?: number;
        attendance?: number;
    };
}

export class EmployeeListResponseDto {
    employees!: EmployeeResponseDto[];
    total!: number;
    page!: number;
    limit!: number;
    totalPages!: number;
}
