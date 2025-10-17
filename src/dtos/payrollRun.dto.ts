import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { PayrollStatus } from "../../generated/prisma";

const DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/

export class CreatePayrollRunDto {
    @IsNotEmpty()
    @IsDateString()
    periodStart!: string;

    @IsNotEmpty()
    @IsDateString()
    periodEnd!: string;
}

export class UpdatePayrollRunDto {
    @IsNotEmpty()
    @IsDateString()
    periodStart!: string;

    @IsNotEmpty()
    @IsDateString()
    periodEnd!: string;

    @IsOptional()
    @IsInt()
    managedById?: number;

    @IsOptional()
    @IsString()
    @IsEnum(PayrollStatus)
    status?: PayrollStatus;

    @IsOptional()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "Invalid gross." })
    totalGross?: string

    @IsOptional()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "Invalid Net." })
    totalNet?: string

    @IsOptional()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "Invalid tax." })
    totalTax?: string

    @IsOptional()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "Invalid employer contrib." })
    totalEmployerContrib?: string

}