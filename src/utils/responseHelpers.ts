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