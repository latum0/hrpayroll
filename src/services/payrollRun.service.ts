import { EmployeeStatus, EmploymentContract, PayrollLine, Payslip } from "../../generated/prisma";
import { Decimal } from "../../generated/prisma/runtime/library";
import prisma from "../config/database";
import { CreatePayrollRunDto, UpdatePayrollRunDto } from "../dtos/payrollRun.dto";
import { CreatePayslipDto } from "../dtos/payslip.dto";
import { EmploymentContractResponseDto, PayrollRunListResponseDto, PayrollRunResponseDto } from "../dtos/reponses.dto";
import { ServiceResponse } from "../types/service";
import { BadRequestError } from "../utils/errors";
import { ensureExists, stripNullish } from "../utils/helper";
import { toLineResponseDto, toPayrollRunResponseDto } from "../utils/responseHelpers";
import { createHistoryService } from "./history.service";
import { createPayrollLine } from "./payrollLine.service";


export class Amounts {
    payslipId!: number;
    grossAmount!: string;
    taxAmount!: string;
    deductionsAmount!: string;
    netAmount!: string;
}

function contractForEmploee(id: number, contracts: EmploymentContract[]) {
    for (const contract of contracts) {
        if (contract.employeeId === id) {
            return contract.id;
        }
    }
    throw new BadRequestError(`No contract for the employee ${id}`)
}


function linesOfPs(payslip: Payslip, payrollLines: PayrollLine[]) {
    let lines: PayrollLine[] = []
    for (const line of payrollLines) {
        if (line.payslipId === payslip.id) {
            const payload = toLineResponseDto(line)
            lines.push(
                payload
            )
        }
    }
    return lines;
}


export async function createPayrollRun(dto: CreatePayrollRunDto, userId: number, user: string): Promise<ServiceResponse<PayrollRunResponseDto>> {

    /**
     * creating a new payroll run only with dates, then we fill the rest of the fields after these steps:
     *      -get all active employees
     *      -get all active contracts of these employees
     *      -create payslips only with some of the fields
     *      - 
     */
    const payrollRun = await prisma.payrollRun.create({ data: { ...dto, managedById: userId } })
    const employees = await prisma.employee.findMany({ where: { status: EmployeeStatus.ACTIVE } })
    const employeesId = employees.map(e => e.id);
    const contracts = await prisma.employmentContract.findMany({ where: { employeeId: { in: employeesId } }, include: { contractSalaryComponents: true } })
    const contractsId = contracts.map(c => { return c.id })



    const salaryComponents = await prisma.salaryComponent.findMany({ where: { id: { in:} } })

    let payload: CreatePayslipDto[] = [];

    for (const employee of employees) {
        const contractId = contractForEmploee(employee.id, contracts);
        const payrollRunId = payrollRun.id
        const employeeId = employee.id
        const grossAmount = Decimal(0).toString();
        const taxAmount = Decimal(0).toString();
        const deductionsAmount = Decimal(0).toString();
        const netAmount = Decimal(0).toString();
        payload.push({
            employmentContractId: contractId,
            payrollRunId,
            employeeId,
            grossAmount,
            taxAmount,
            deductionsAmount,
            netAmount
        })
    }
    const trans = await prisma.$transaction(async (tx) => {
        //we should make sure that a payslip for an employee that already has one shouldn't exists
        await tx.payslip.createMany({ data: payload }) //returns only count
        const payslipsM = await tx.payslip.findMany({ where: { employmentContractId: { in: contractsId }, payrollRunId: payrollRun.id, createdAt: payrollRun.createdAt } })  //returns the rows

        let lines: PayrollLine[] = [];

        for (const ps of payslipsM) {
            if (!ps.employmentContractId) {
                throw new BadRequestError("No contract for this payslip")
            }
            const l = await createPayrollLine(tx, ps, ps.employmentContractId, userId);

            lines.push(...l)
        }
        //we need first to get all lines, then calculate the amounts for the payslip, then we can update the payslips using update many
        const amountsPayload: Amounts[] = []

        for (const ps of payslipsM) {
            //lines of a specific payslip
            const lps = linesOfPs(ps, lines)
            const amounts = calculatePayslipAmounts(tx, lps)
            amountsPayload.push(amounts)
        }


        const updated = amountsPayload.map(a => () =>
            tx.payslip.update({
                where: {
                    id: a.payslipId
                },
                data: {
                    netAmount: a.netAmount,
                    taxAmount: a.taxAmount,
                    grossAmount: a.grossAmount,
                    deductionsAmount: a.deductionsAmount ?? null
                }
            })
        )

        const chunkSize = 200;
        for (let i = 0; i < updated.length; i += chunkSize) {
            const chunk = updated.slice(i, i + chunkSize)
            await Promise.all(chunk.map(fn => fn()));
        }

        const totals = calculateTotals(amountsPayload);

        const finalPr = await tx.payrollRun.update({
            where: {
                id: payrollRun.id
            },
            data: {
                totalGross: totals.Gross,
                totalNet: totals.Net,
                totalTax: totals.Tax,
                totalEmployerContrib: totals.employerContrib ?? null
            }
        })
        return finalPr
    })

    const responsePayload = toPayrollRunResponseDto(trans);
    return { statusCode: 201, data: responsePayload, message: "Payroll run created." }

}


export async function updatePayrollRun(dto: UpdatePayrollRunDto, id: number, userId: number, user: string): Promise<ServiceResponse<PayrollRunResponseDto>> {
    await ensureExists(() => prisma.payrollRun.findUnique({ where: { id } }), "Payroll Run.")
    if (dto.periodStart && dto.periodEnd) {
        return await createPayrollRun(dto, userId, user)
    }

    const strp = stripNullish(dto);
    if (strp.managedById) {
        await ensureExists(() => prisma.employee.findUnique({ where: { id: strp.managedById, user: { role: { name: { in: ["ADMIN", "MANAGER"] } } } } }), "Manager")
    }
    const updated = await prisma.$transaction(async (tx) => {
        const pr = await tx.payrollRun.update({ where: { id }, data: strp })
        await createHistoryService(tx, userId, user, `Payroll run ${id} has been updated.`)
        return pr;
    })

    const payload = toPayrollRunResponseDto(updated)
    return { statusCode: 200, data: payload, message: "Payroll run updated." }

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
