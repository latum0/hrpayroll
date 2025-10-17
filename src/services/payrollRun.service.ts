import { EmployeeStatus, EmploymentContract, Payslip } from "../../generated/prisma";
import { Decimal } from "../../generated/prisma/runtime/library";
import prisma from "../config/database";
import { CreatePayrollRunDto, UpdatePayrollRunDto } from "../dtos/payrollRun.dto";
import { createPayslip } from "../dtos/payslip.dto";
import { EmploymentContractResponseDto, PayrollRunListResponseDto, PayrollRunResponseDto } from "../dtos/reponses.dto";
import { ServiceResponse } from "../types/service";
import { BadRequestError } from "../utils/errors";
import { ensureExists } from "../utils/helper";
import { toPayrollRunResponseDto } from "../utils/responseHelpers";
import { createHistoryService } from "./history.service";


function contractForEmploee(id: number, contracts: EmploymentContract[]) {
    for (const contract of contracts) {
        if (contract.employeeId === id) {
            return contract.id;
        }
    }
    throw new BadRequestError(`No contract for the employee ${id}`)


}



export async function createPayrollRun(dto: CreatePayrollRunDto, userId: number): Promise<ServiceResponse<PayrollRunResponseDto>> {
    const payrollRun = await prisma.payrollRun.create({ data: { ...dto, managedById: userId } })
    const employees = await prisma.employee.findMany({ where: { status: EmployeeStatus.ACTIVE } })
    const employeesId = employees.map(e => e.id);
    const contracts = await prisma.employmentContract.findMany({ where: { id: { in: employeesId } } })


    for (const employee of employees) {
        const contractId = contractForEmploee(employee.id, contracts);
        const payrollRunId = payrollRun.id
        const employeeId = employee.id
        const grossAmount = Decimal(0).toString();
        const taxAmount = Decimal(0).toString();
        const deductionsAmount = Decimal(0).toString();
        const netAmount = Decimal(0).toString();
        const payload: createPayslip = {
            employmentContractId: contractId,
            payrollRunId,
            employeeId,
            grossAmount,
            taxAmount,
            deductionsAmount,
            netAmount
        }
    }
}

export async function updatePayrollRun(dto: UpdatePayrollRunDto, userId: number, user: string): Promise<ServiceResponse<PayrollRunResponseDto>> {

}

export async function getPayrollById(id: number): Promise<ServiceResponse<PayrollRunResponseDto>> {
    const payrollRun = await ensureExists(() => prisma.payrollRun.findUnique({ where: { id } }), "Payroll run")
    const payload = toPayrollRunResponseDto(payrollRun)
    return { statusCode: 200, data: payload }

}

export async function getAllPayrollRun(): Promise<ServiceResponse<PayrollRunResponseDto[]>> {
    const prs = await prisma.payrollRun.findMany({
        select: {
            id: true,
            periodStart: true,
            periodEnd: true,
            status: true,
            managedById: true,
            createdAt: true,
            totalGross: true,
            totalTax: true,
            totalNet: true,
            totalEmployerContrib: true,
        }
    });

    const payload = prs.map((p) => {
        return toPayrollRunResponseDto(p)
    }
    )

    return { statusCode: 200, data: payload }
}


export async function deletePayrollRun(id: number, userId: number, acteur: string): Promise<ServiceResponse<void>> {
    await ensureExists(() => prisma.payrollRun.findUnique({ where: { id } }), "Payroll Run")
    await prisma.$transaction(async (tx) => {
        await tx.payrollRun.delete({ where: { id } })
        await createHistoryService(tx, userId, acteur, `Deleted a payroll run with the ID ${id}`)
    })

    return { statusCode: 200, message: "Payroll run deleted." }

}
