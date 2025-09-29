import { IsString, IsInt, IsOptional, ValidateIf, IsIBAN, Matches, IsNotEmpty } from "class-validator";

export class CreateBankAccountDto {
    @IsInt()
    employeeId!: number;

    @ValidateIf(o => !!o.iban)
    @IsNotEmpty({ message: 'Account holder name is required when iban number is provided' })
    @IsString()
    accountHolderName?: string;

    @IsOptional()
    @IsString()
    @IsIBAN({ message: "IBAN must valid" })
    iban?: string;

    @ValidateIf(o => !!o.iban)
    @IsNotEmpty({ message: 'bic is required when iban number is provided' })
    @IsString()
    bic?: string;

    @ValidateIf(o => !!o.iban)
    @IsNotEmpty({ message: 'Bank name is required when iban number is provided' })
    @IsString()
    bankName?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{10}$/, { message: "Ccp account number must be valid" })
    ccpAccountNumber?: string;

    @ValidateIf(o => !!o.ccpAccountNumber)
    @IsNotEmpty({ message: 'CCP key is required when CCP account number is provided' })
    @IsString()
    @Matches(/^\d{2}$/, { message: "Key must be valid" })
    ccpKey?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{20}$/, { message: "RIP must be valid" })
    rip?: string;
}

export class UpdateBankAccountDto {
    @IsOptional()
    @IsInt()
    employeeId?: number;

    @ValidateIf(o => o.iban !== undefined)
    @IsNotEmpty({ message: 'Account holder name is required when iban number is provided' })
    @IsString()
    @IsOptional()
    accountHolderName?: string | null;

    @IsOptional()
    @IsString()
    @IsIBAN({ message: "IBAN must valid" })
    iban?: string | null;

    @ValidateIf(o => o.iban !== undefined)
    @IsNotEmpty({ message: 'bic is required when iban number is provided' })
    @IsString()
    @IsOptional()
    bic?: string | null;

    @ValidateIf(o => o.iban !== undefined)
    @IsNotEmpty({ message: 'Bank name is required when iban number is provided' })
    @IsString()
    @IsOptional()
    bankName?: string | null;

    @IsOptional()
    @IsString()
    @Matches(/^\d{10}$/, { message: "Ccp account number must be valid" })
    ccpAccountNumber?: string | null;

    @ValidateIf(o => o.ccpAccountNumber !== undefined)
    @IsOptional()
    @IsString()
    @Matches(/^\d{2}$/, { message: "Key must be valid" })
    ccpKey?: string | null;

    @IsOptional()
    @IsString()
    @Matches(/^\d{20}$/, { message: "RIP must be valid" })
    rip?: string | null;
}