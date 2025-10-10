import { Decimal } from "@prisma/client/runtime/library";
import { createPayslipDto } from "../dtos/payslip.dto";




export async function createPayslip(employeeId: number, contractId: number, payrollRunId: number): Promise<void> {
    const grossAmount = Decimal(0).toString();
    const taxAmount = Decimal(0).toString();
    const deductionsAmount = Decimal(0).toString();
    const netAmount = Decimal(0).toString();

    

}