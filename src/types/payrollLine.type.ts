export class CreatePayrollLine {
    payslipId!: number;
    salaryComponentId!: number;
    description?: string;
    amount!: string;
    taxable!: boolean;
    createdById!: number;
}
