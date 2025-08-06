export class NotFoundError extends Error {
    constructor(entity: string, field?: string) {
        super(field ? `${entity} with this ${field} already exists` : `${entity} conflict`);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);

    }
}

export class ConflictError extends Error {
    constructor(entity: string, field?: string) {
        super(field ? `${entity} with this ${field} already exists` : `${entity} conflict`);
        this.name = "ConflictError";
        Object.setPrototypeOf(this, ConflictError.prototype)
    }
}

export class ValidationError extends Error {
    public readonly details?: unknown;

    constructor(message: string, details?: unknown) {
        super(message);
        this.name = "ValidationError";
        this.details = details;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}


export class UnauthorizedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UnauthorizedError";
        Object.setPrototypeOf(this, UnauthorizedError.prototype)
    }
}
