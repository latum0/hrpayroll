export type ServiceResponse<T> = {
    statusCode: number;
    data?: T;
    error?: string;
    message?: string
};