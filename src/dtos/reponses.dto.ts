export class UserResponseDto {
    id!: number;
    email!: string;
    firstName!: string;
    lastName!: string;
    roleId!: number;
    phone?: string | null;
    emailVerified!: boolean;
    createdAt!: Date;
    updatedAt!: Date;
    status?: string | null;

    role?: {
        id: number;
        name: string;
        description?: string | null;
    };

    employee?: {
        id: number;
        jobTitle?: string | null;
        hireDate?: Date | null;
        status?: string | null;
    };
}



export class UserListResponseDto {
    users!: UserResponseDto[];
    total!: number;
    page!: number;
    limit!: number;
    totalPages!: number;
}



export class DepartmentResponseDto {
    id!: number;
    name!: string;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;

    _count?: {
        employees?: number;
        LeaveRequest?: number;
    };
}

export class DepartmentListResponseDto {
    departments!: DepartmentResponseDto[];
    total!: number;
    page!: number;
    limit!: number;
    totalPages!: number;
}


export class EmployeeResponseDto {
    id!: number;
    user?: {
        id: number;
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string | null;
    } | null;
    dob?: Date | null;
    nationalId?: string | null;
    taxId?: string | null;
    jobTitle?: string | null;
    hireDate?: Date | null;
    terminationDate?: Date | null;
    status?: string;
    managerId?: number | null;
    department?: {
        id: number;
        name: string;
    } | null;
    createdAt?: Date;
    updatedAt?: Date;

    _count?: {
        bankAccounts?: number;
        contracts?: number;
        payslips?: number;
        leaveRequests?: number;
        attendance?: number;
    };
}

export class EmployeeListResponseDto {
    employees!: EmployeeResponseDto[];
    total!: number;
    page!: number;
    limit!: number;
    totalPages!: number;
}


export class PermissionResponseDto {
    id!: number;
    name!: string;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;

    _count?: {
        rolePermissions?: number;
        userPermissions?: number;
    };
}

export class PermissionListResponseDto {
    permissions!: PermissionResponseDto[];
    total!: number;
    page!: number;
    limit!: number;
    totalPages!: number;
}



export class RoleResponseDto {
    id!: number;
    name!: string;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;

    _count?: {
        users?: number;
    };
}

export class RoleListResponseDto {
    roles!: RoleResponseDto[];
    total!: number;
    page!: number;
    limit!: number;
    totalPages!: number;
}



export class AttendanceResponseDto {
    createdAt?: string;
    checkIn!: string;
    checkOut!: string;
    employee!: {
        id: number;
        firstName: string;
    }
    validatedById!: number;
    payrollRunId?: number | null;
    note?: string | null;
}

export class AttendanceListResponseDto {
    attendances!: AttendanceResponseDto[];
    total!: number;
    page!: number;
    limit!: number;
    totalPages!: number;
}
