import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateContractSalaryComponentDto {
    @IsNotEmpty()
    @IsNumber()
    contractId!: number;

    @IsNotEmpty()
    @IsNumber()
    salaryComponentId!: number;

    @IsOptional()
    @IsString()
    amount?: string;

    @IsOptional()
    @IsBoolean()
    active?: boolean;
}
