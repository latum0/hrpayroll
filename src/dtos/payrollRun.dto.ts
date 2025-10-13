import { IsDateString, IsNotEmpty } from "class-validator";


export class CreatePayrollRunDto {
    @IsNotEmpty()
    @IsDateString()
    periodStart!: string;

    @IsNotEmpty()
    @IsDateString()
    periodEnd!: string;

}