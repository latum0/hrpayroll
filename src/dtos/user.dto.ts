import { IsEmail, IsNotEmpty, IsString, IsOptional, IsInt, MinLength, IsBoolean, IsPhoneNumber, Matches } from 'class-validator';

export class BaseUserDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(/[A-Z]/, { message: "Le mot de passe doit contenir une majuscule" })
    @Matches(/[a-z]/, { message: "Le mot de passe doit contenir une minuscule" })
    @Matches(/[0-9]/, { message: "Le mot de passe doit contenir un chiffre" })
    @Matches(/[^A-Za-z0-9]/, {
        message: "Le mot de passe doit contenir un caractère spécial",
    })
    password!: string;

    @IsOptional()
    @IsInt()
    @IsNotEmpty()
    roleId?: number;

    @IsString()
    @IsOptional()
    @Matches(/^(\+213|0)(5|6|7)[0-9]{8}$/, {
        message: "Numéro de téléphone algérien invalide",
    })
    phone!: string;

    @IsBoolean()
    @IsNotEmpty()
    emailVerified!: boolean;
}

export class CreateUserDto extends BaseUserDto {
}

export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(8)
    @Matches(/[A-Z]/, { message: "Le mot de passe doit contenir une majuscule" })
    @Matches(/[a-z]/, { message: "Le mot de passe doit contenir une minuscule" })
    @Matches(/[0-9]/, { message: "Le mot de passe doit contenir un chiffre" })
    @Matches(/[^A-Za-z0-9]/, {
        message: "Le mot de passe doit contenir un caractère spécial",
    })
    password?: string;

    @IsOptional()
    @IsInt()
    roleId?: number;

    @IsOptional()
    @IsPhoneNumber()
    phone?: string;

    @IsOptional()
    @IsBoolean()
    emailVerified?: boolean;
}

export class UserResponseDto {
    id!: number;
    email!: string;
    name!: string;
    roleId!: number;
    phone!: string;
    emailVerified!: boolean;
    createdAt!: Date;
    updatedAt!: Date;

    role?: {
        id: number;
        name: string;
        description?: string;
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
    @Matches(/[^A-Za-z0-9]/, {
        message: "Le mot de passe doit contenir un caractère spécial",
    })
    newPassword!: string;
}

export class UserListResponseDto {
    users!: UserResponseDto[];
    total!: number;
    page!: number;
    limit!: number;
    totalPages!: number;
}