import { EmploymentContract, PayrollLine, Payslip, Prisma, SalaryComponent } from "../../generated/prisma";
import { Decimal } from "../../generated/prisma/runtime/library";
import { CreatePayrollLine } from "../types/payrollLine.type";
import { BadRequestError } from "../utils/errors";
import { ensureExists } from "../utils/helper";




export async function createPayrollLine(tx: Prisma.TransactionClient, payslip: Payslip, contractId: number, userId: number) {

    const contract = await tx.employmentContract.findUnique({
        where: {
            id: contractId
        },
        include: {
            contractSalaryComponents: {
                include: {
                    salaryComponent: true
                }
            }
        }
    })

    const sc = contract?.contractSalaryComponents.map((csc) =>
        csc.salaryComponent
    )

    if (!sc) {
        throw new BadRequestError(`The contract ${contractId} has no salary components.`)
    }


    const scPayload: CreatePayrollLine[] = await Promise.all(
        sc.map(async (s) => {
            const amount = (await getAmount(tx, s.id)).toString();
            return {
                salaryComponentId: s.id,
                payslipId: payslip.id,
                amount,
                taxable: s.taxable,
                createdById: userId,
            };
        })
    );

    await tx.payrollLine.createMany({ data: scPayload })
    const lines = tx.payrollLine.findMany({ where: { payslipId: payslip.id } })
    return lines;
}

async function getAmount(tx: Prisma.TransactionClient, scId: number) {
    const csc = await ensureExists(() => tx.contractSalaryComponent.findFirst({ where: { salaryComponentId: scId } }), "Contract salary component")
    const amount = new Prisma.Decimal(csc.amount ?? 0)
    return amount;
}



