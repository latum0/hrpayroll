import { CreatePayslipDto } from "../dtos/payslip.dto";
import { PayrollLine, Payslip, Prisma } from "../../generated/prisma";
import { createPayrollLine } from "./payrollLine.service";
import { BadRequestError } from "../utils/errors";




export async function createPayslipsInPayrollRun(tx: Prisma.TransactionClient, payload: CreatePayslipDto[], contractIds: number[], contracts: any, payrollRunId: number, createdAt: string, userId: number): Promise<void> {
    await tx.payslip.createMany({ data: payload }) //returns only count
    const payslips = await tx.payslip.findMany({
        where: {
            employmentContractId: { in: contractIds },
            payrollRunId,
            createdAt
        }
    })
    let lines: PayrollLine[] = []

    for (const ps of payslips) {
        if (!ps.employmentContractId) {
            throw new BadRequestError(`The payslip ${ps.id} has no contract.`)
        }
        const l = await createPayrollLine(tx, ps, ps.employmentContractId, userId)
        lines.push(...l)
    }


}


function calculatePayslipsAmounts(payslips: Payslip[], lines: PayrollLine[]) {

    const updatePayload: Partial<Payslip>[] = []

    payslips.map(p => {

    })


}