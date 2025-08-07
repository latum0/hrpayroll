import { ErrorRequestHandler } from "express";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError, ValidationError } from "../utils/errors";



export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof BadRequestError) {
        res.status(400).json(
            {
                error: err.name,
                message: err.message
            }
        )
    }

    if (err instanceof NotFoundError) {
        res.status(404).json({
            error: err.name,
            message: err.message,
        });
        return;
    }

    if (err instanceof ConflictError) {
        res.status(409).json({
            error: err.name,
            message: err.message,
        });
        return;
    }

    if (err instanceof ValidationError) {
        res.status(422).json({
            error: err.name,
            message: err.message,
            details: err.details,
        });
        return;
    }

    if (err instanceof UnauthorizedError) {
        res.status(401).json({
            error: err.name,
            message: err.message
        })
    }

    console.error("[UnhandledError]", err);

    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
}