import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { ComponentType, SalaryComponentCode } from "../../generated/prisma";

export class CreateSalaryComponentDto {
    @IsNotEmpty()
    @IsEnum(SalaryComponentCode)
    code!: SalaryComponentCode;

    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @IsNotEmpty()
    @IsEnum(ComponentType)
    componentType!: ComponentType;

    @IsOptional()
    @IsBoolean()
    taxable?: boolean;

    @IsOptional()
    @IsBoolean()
    employerPaid?: boolean;

    @IsOptional()
    defaultAmount?: string;

    @IsOptional()
    capAmount?: string;

    @IsOptional()
    @IsString()
    glAccount?: string;
}
