// dtos/role.dto.ts
import { IsNotEmpty, IsOptional, IsString, Length, MaxLength } from "class-validator";

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;
}

export class UpdateRoleDto {
    @IsOptional()
    @IsString()
    @Length(1, 100)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;
}
