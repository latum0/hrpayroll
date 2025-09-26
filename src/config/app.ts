import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import userRoutes from '../routes/user.route';
import authRoutes from '../routes/auth.route';
import historyRoutes from '../routes/history.route';
import roleRoutes from '../routes/role.route';
import permissionRoutes from '../routes/permission.route';
import departmentRoutes from '../routes/department.route';
import employeeRoutes from '../routes/employee.route';
import attendanceRoutes from "../routes/attendance.route"
import LeaveRoutes from "../routes/leaveRequest.route"

import { errorHandler } from '../middlewares/error-handler';
import { scheduleHistoriqueCleanup } from '../job/historyCleanup';


dotenv.config();



// import payrollRoutes from '../routes/payroll';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/histories', historyRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employee', employeeRoutes);
app.use("/api/attendances", attendanceRoutes)
app.use("/api/leaves", LeaveRoutes)

// 404 handler - catch all unmatched routes
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
    });
});
app.use(errorHandler)
scheduleHistoriqueCleanup(process.env.HISTO_CLEANUP_CRON);


export { app, PORT }; 