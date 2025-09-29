import { AbsenceResponseDto, AttendanceResponseDto, LeaveRequestResponseDto } from "../dtos/reponses.dto";

export function toAbsenceResponseDto(absence: any): AbsenceResponseDto {
    return {
        id: absence.id,
        employee: {
            id: absence.employee.id,
            email: absence.employee.user?.email ?? null,
        },
        date: absence.date.toISOString(),
        type: absence.type ?? null,
        hours: absence.hours ?? null,
        reason: absence.reason ?? null,
        leaveRequestId: (absence as any).leaveRequestId ?? null,
        payrollRunId: absence.payrollRunId ?? null,
        createdAt: absence.createdAt?.toISOString(),
    };
}


export function toLeaveRequestResponseDto(updated: any): LeaveRequestResponseDto {
    return {
        id: updated.id,
        employee: {
            id: updated.employee.id,
            email: updated.employee.user?.email ?? null,
        },
        department: updated.department
            ? { id: updated.department.id, name: updated.department.name }
            : null,
        startDate: updated.startDate.toISOString(),
        endDate: updated.endDate.toISOString(),
        type: updated.type,
        days: updated.days ?? null,
        status: updated.status,
        reason: updated.reason ?? null,
        payrollNote: updated.payrollNote ?? null,
        approvedBy: updated.approvedBy
            ? {
                id: updated.approvedBy.id,
                email: updated.approvedBy.email ?? null,
            }
            : null,
        usersId: (updated as any).usersId ?? null,
        payrollRunId: updated.payrollRunId ?? null,
        createdAt: updated.createdAt?.toISOString(),
        approvedAt: updated.approvedAt ? updated.approvedAt.toISOString() : null,
    };
}



export function createPayloadAttendanceResponse(
    createdAt: string,
    checkIn: string,
    checkOut: string,
    employeeId: number,
    employeeName: string,
    validatedById: number,
    note: string | null,
    payrollRunId: number | null) {
    const payload: AttendanceResponseDto = {
        checkIn,
        checkOut,
        createdAt,
        payrollRunId,
        note,
        employee: {
            id: employeeId,
            firstName: employeeName
        },
        validatedById
    }

    return payload;

}

export function toEmploymentContractResponseDto(contract: any) {
    return {
        id: contract.id,
        employee: { id: contract.employee.id, email: contract.employee.user?.email ?? null },
        title: contract.title ?? null,
        startDate: contract.startDate.toISOString(),
        endDate: contract.endDate ? contract.endDate.toISOString() : null,
        payFrequency: contract.payFrequency ?? null,
        payType: contract.payType ?? null,
        status: contract.status ?? null,
        createdAt: contract.createdAt?.toISOString(),
    };
}


export function toNotificationResponseDto(notification: any) {
    return {
        id: notification.id,
        type: notification.type,
        employee: notification.Employee ? { id: notification.Employee.user.id ?? null, email: notification.Employee.user?.email ?? null } : null,
        department: notification.Department ? { id: notification.Department.id ?? null, name: notification.Department.name ?? null } : null,
        payslipId: notification.payslipId ?? null,
        payload: notification.payload ?? null,
        status: notification.status,
        createdAt: notification.createdAt,
    };
}

export function toBankAccountResponseDto(account: any) {
    const employee = account.employee ?? { id: account.employeeId, user: undefined };
    return {
        id: account.id,
        employee: {
            id: employee?.id ?? account.employeeId,
            firstName: employee?.user?.firstName ?? null,
            lastName: employee?.user?.lastName ?? null,
            email: employee?.user?.email ?? null,
        },
        accountHolderName: account.accountHolderName ?? null,
        ibanMasked: account.ibanMasked ?? null,
        bankName: account.bankName ?? null,
        bic: account.bic ?? null,
        ccpAccountNumber: account.ccpAccountNumber ?? null,
        rip: account.rip ?? null,
        createdAt: account.createdAt ? account.createdAt.toISOString() : undefined,
    };
}