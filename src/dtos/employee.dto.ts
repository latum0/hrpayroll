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
    status?: string;
}

