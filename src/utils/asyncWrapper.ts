import { RequestHandler } from "express";

export function asyncWrapper(fn: RequestHandler): RequestHandler {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}