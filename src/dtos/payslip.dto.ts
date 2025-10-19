import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Matches } from "class-validator";


const DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/;

export class CreatePayslipDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    employmentContractId!: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    payrollRunId!: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    employeeId!: number;

    @IsNotEmpty()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "Gross amount must be a decimal" })
    grossAmount!: string;

    @IsNotEmpty()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "Tax amount must be a decimal" })
    taxAmount!: string;

    @IsNotEmpty()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "Deductions amount must be a decimal" })
    deductionsAmount!: string;

    @IsNotEmpty()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "Net amount must be a decimal" })
    netAmount!: string;
}