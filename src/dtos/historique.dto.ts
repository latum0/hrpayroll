import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";



export class CreateHistoriqueDto {
    @IsDate() @IsNotEmpty() createdAt!: Date;
    @IsString() @IsNotEmpty() acteur!: string;
    @IsString() @IsNotEmpty() action!: string;
    @IsNumber() @IsNotEmpty() userId!: number;
}