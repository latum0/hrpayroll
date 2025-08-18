import { IsNotEmpty, IsOptional, IsString, Length, MaxLength } from "class-validator";

export class CreateDepartmentDto {
    @IsString()
    @IsNotEmpty()
    @Length(1, 200)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;
}

export class UpdateDepartmentDto {
    @IsOptional()
    @IsString()
    @Length(1, 200)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;
}

export class DepartmentResponseDto {
    id!: number;
    name!: string;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;

    _count?: {
        employees?: number;
        LeaveRequest?: number;
    };
}

export class DepartmentListResponseDto {
    departments!: DepartmentResponseDto[];
    total!: number;
    page!: number;
    limit!: number;
    totalPages!: number;
}
