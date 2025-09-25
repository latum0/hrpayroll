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

