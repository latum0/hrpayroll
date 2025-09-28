import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { NotificationStatus } from "../../generated/prisma";

export class CreateNotificationDto {
    @IsNotEmpty()
    @IsString({ message: "Type must be a string." })
    type!: string;

    @IsOptional()
    @IsString({ message: "Type must be a string." })
    payload?: string | null;

    @IsOptional()
    @IsNumber({}, { message: "Payslip ID must be a number." })
    @IsPositive()
    payslipId?: number | null;
}

export class CreateNotificationEmployeeDto extends CreateNotificationDto {

    @IsNotEmpty()
    @IsNumber({}, { message: "Employee ID must be a number." })
    @IsPositive()
    employeeId!: number | null;
}


export class CreateNotificationDepartmentDto extends CreateNotificationDto {


    @IsNotEmpty()
    @IsNumber({}, { message: "Department ID must be a number." })
    @IsPositive()
    departmentId!: number | null;
}

export class UpdateNotificationStatusDto {
    @IsNotEmpty()
    @IsEnum(NotificationStatus)
    status!: NotificationStatus;
}
