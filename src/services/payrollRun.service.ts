import { EmployeeStatus, EmploymentContract, Payslip } from "../../generated/prisma";
import { Decimal } from "../../generated/prisma/runtime/library";
import prisma from "../config/database";
import { CreatePayrollRunDto } from "../dtos/payrollRun.dto";
import { createPayslip } from "../dtos/payslip.dto";
import { EmploymentContractResponseDto, payrollRunResponseDto } from "../dtos/reponses.dto";
import { ServiceResponse } from "../types/service";
import { BadRequestError } from "../utils/errors";


function contractForEmploee(id: number, contracts: EmploymentContract[]) {
    for (const contract of contracts) {
        if (contract.employeeId === id) {
            return contract.id;
        }
    }
    throw new BadRequestError(`No contract for the employee ${id}`)


}



export async function createPayrollRun(dto: CreatePayrollRunDto, userId: number): Promise<ServiceResponse<payrollRunResponseDto>> {

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
