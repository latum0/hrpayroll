// dtos/permission.dto.ts
import { IsNotEmpty, IsOptional, IsString, Length, MaxLength } from "class-validator";

export class CreatePermissionDto {
    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;
}

export class UpdatePermissionDto {
    // Do not accept null; omit a field to not update it.
    @IsOptional()
    @IsString()
    @Length(1, 100)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;
}

/* Response DTOs */
export class PermissionResponseDto {
    id!: number;
    name!: string;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;

    // optional counts if included in queries
    _count?: {
        rolePermissions?: number;
        userPermissions?: number;
    };
}

export class PermissionListResponseDto {
    permissions!: PermissionResponseDto[];
    total!: number;
    page!: number;
    limit!: number;
    totalPages!: number;
}
