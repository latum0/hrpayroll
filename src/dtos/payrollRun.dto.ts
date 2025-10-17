import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreatePayrollRunDto {
    @IsNotEmpty()
    @IsDateString()
    periodStart!: string;

    @IsNotEmpty()
    @IsDateString()
    periodEnd!: string;

}

export class UpdatePayrollRunDto {
    @IsOptional()
    @IsDateString()
    periodStart?: string;

    @IsOptional()
    @IsDateString()
    periodEnd?: string;

    @IsOptional()
    @IsInt()
    managedById?: number;

    @IsOptional()
    @IsString()
    totalGross?: string

    @IsOptional()
    @IsString()
    totalNet?: string

    @IsOptional()
    @IsString()
    totalTax?: string

    @IsOptional()
    @IsString()
    totalEmployerContrib?: string

}