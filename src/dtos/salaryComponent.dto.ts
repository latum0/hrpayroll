import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from "class-validator";
import { ComponentType, SalaryComponentCode } from "../../generated/prisma";

const DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/;

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
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "Invalid default amount." })
    defaultAmount?: string;

    @IsOptional()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "Invalid cap amount." })
    capAmount?: string;

    @IsOptional()
    @IsString()
    glAccount?: string;
}
