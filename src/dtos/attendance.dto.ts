import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";


export class CreateAttendanceDto {

    @IsNotEmpty()
    @IsDateString()
    checkIn!: string;

    @IsNotEmpty()
    @IsDateString()
    checkOut!: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    employeeId!: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    payrollRunId?: number;

    @IsOptional()
    @IsString()
    note?: string;

}

export class UpdateAttendanceDto {
    @IsOptional()
    @IsDateString()
    createdAt?: string;

    @IsOptional()
    @IsDateString()
    checkIn?: string;

    @IsOptional()
    @IsDateString()
    checkOut?: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    employeeId?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    payrollRunId?: number;

    @IsOptional()
    @IsString()
    note?: string;

}