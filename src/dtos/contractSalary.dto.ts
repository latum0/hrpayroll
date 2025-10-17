import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from "class-validator";
const DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/;

export class CreateContractSalaryComponentDto {
    @IsNotEmpty()
    @IsNumber()
    contractId!: number;

    @IsNotEmpty()
    @IsNumber()
    salaryComponentId!: number;

    @IsOptional()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "Invalid amount." })
    amount?: string;

    @IsOptional()
    @IsBoolean()
    active?: boolean;
}
