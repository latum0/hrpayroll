import { ComponentType, ContractSalaryComponent, EmploymentContract, PayrollLine, Payslip, Prisma, SalaryComponent } from "../../generated/prisma";
import { Decimal } from "../../generated/prisma/runtime/library";
import { CreatePayrollLine } from "../types/payrollLine.type";
import { BadRequestError } from "../utils/errors";
import { ensureExists } from "../utils/helper";




export async function createPayrollLine(tx: Prisma.TransactionClient, payslip: Payslip, contractId: number, userId: number): Promise<PayrollLine[]> {

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


export async function calculateGrossSalary(
    tx: Prisma.TransactionClient,
    contractId: number,
    payrollRunId: number,
    csc: ContractSalaryComponent /*we check if the sc type is BASE*/,
    sc: SalaryComponent
): Promise<Decimal> {
    const contract = await ensureExists(() => tx.employmentContract.findUnique({ where: { id: contractId } }), "Employment Contract")
    const employeeId = contract.employeeId;
    let totalDays = 0;
    const attendances = await tx.attendance.count({ where: { payrollRunId, employeeId } })
    const validAbsences = await tx.absence.count({ where: { payrollRunId, employeeId, type: { in: ["PAID", "SICK"] } } })
    totalDays = attendances + validAbsences;
    let earning = new Prisma.Decimal(0);
    let deduction = new Prisma.Decimal(0);
    let salary = new Prisma.Decimal(0);
    if (!csc.amount) {
        throw new BadRequestError("There is no amount in Contract salary component for this contract.")
    }

    if (sc.componentType === ComponentType.EARNING) {
        earning = Decimal(earning).plus(csc.amount)
        salary = Decimal(salary).plus(csc.amount)
    }

    if (sc.componentType === ComponentType.DEDUCTION) {
        earning = Decimal(earning).plus(csc.amount)
        salary = Decimal(salary).plus(csc.amount)
    }



    const grossSalary = new Prisma.Decimal(csc.amount).mul(totalDays)
    return grossSalary
}
export async function calculateTax(tx: Prisma.TransactionClient, contractId: number, payrollRunId: number, csc: ContractSalaryComponent /*we check if the sc type is TAX*/): Promise<Decimal> {

}



export async function calculatePayPerHour() {

}