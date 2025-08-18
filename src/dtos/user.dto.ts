import {
    IsEmail,
    IsNotEmpty,
    IsString,
    IsOptional,
    IsInt,
    MinLength,
    IsBoolean,
    Matches,
    IsIn,
} from 'class-validator';


const USER_STATUS_VALUES = ['PENDING', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED', 'ONBOARDING', 'OFFBOARDING'];

export class BaseUserDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(/[A-Z]/, { message: "Le mot de passe doit contenir une majuscule" })
    @Matches(/[a-z]/, { message: "Le mot de passe doit contenir une minuscule" })
    @Matches(/[0-9]/, { message: "Le mot de passe doit contenir un chiffre" })
    @Matches(/[^A-Za-z0-9]/, { message: "Le mot de passe doit contenir un caractère spécial" })
    password!: string;

    @IsOptional()
    @IsInt()
    roleId?: number = 2;

    @IsOptional()
    @Matches(/^(\+213|0)(5|6|7)[0-9]{8}$/, {
        message: "Numéro de téléphone algérien invalide",
    })
    phone?: string;

    @IsOptional()
    @IsBoolean()
    emailVerified: boolean = false;

    @IsOptional()
    @IsInt()
    companyId?: number;

    @IsOptional()
    @IsString()
    @IsIn(USER_STATUS_VALUES, { message: 'Invalid user status' })
    status?: string;
}

export class CreateUserDto extends BaseUserDto { }

export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    @MinLength(8)
    @Matches(/[A-Z]/, { message: "Le mot de passe doit contenir une majuscule" })
    @Matches(/[a-z]/, { message: "Le mot de passe doit contenir une minuscule" })
    @Matches(/[0-9]/, { message: "Le mot de passe doit contenir un chiffre" })
    @Matches(/[^A-Za-z0-9]/, { message: "Le mot de passe doit contenir un caractère spécial" })
    password?: string;

    @IsOptional()
    @IsInt()
    roleId?: number;

    @IsOptional()
    @Matches(/^(\+213|0)(5|6|7)[0-9]{8}$/, {
        message: "Numéro de téléphone algérien invalide",
    })
    phone?: string;

    @IsOptional()
    @IsBoolean()
    emailVerified?: boolean;

    @IsOptional()
    @IsInt()
    companyId?: number;

    @IsOptional()
    @IsString()
    @IsIn(USER_STATUS_VALUES, { message: 'Invalid user status' })
    status?: string;
}

export class UserResponseDto {
    id!: number;
    email!: string;
    firstName!: string;
    lastName!: string;
    roleId!: number;
    phone?: string | null;
    emailVerified!: boolean;
    createdAt!: Date;
    updatedAt!: Date;
    companyId?: number | null;
    status?: string | null;

    role?: {
        id: number;
        name: string;
        description?: string | null;
    };

    employee?: {
        id: number;
        companyId: number;
        jobTitle?: string | null;
        hireDate?: Date | null;
        status?: string | null;
    };
}

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;
}

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty()
    currentPassword!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(/[A-Z]/, { message: "Le mot de passe doit contenir une majuscule" })
    @Matches(/[a-z]/, { message: "Le mot de passe doit contenir une minuscule" })
    @Matches(/[0-9]/, { message: "Le mot de passe doit contenir un chiffre" })
    @Matches(/[^A-Za-z0-9]/, { message: "Le mot de passe doit contenir un caractère spécial" })
    newPassword!: string;
}

export class UserListResponseDto {
    users!: UserResponseDto[];
    total!: number;
    page!: number;
    limit!: number;
    totalPages!: number;
}

export class UpdateOwnUserDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @Matches(/^(\+213|0)(5|6|7)[0-9]{8}$/, {
        message: "Numéro de téléphone algérien invalide",
    })
    phone?: string;
}
