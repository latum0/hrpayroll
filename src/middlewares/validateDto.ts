

import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError as ClassValidatorError } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../utils/errors";

export const validateDto = (DtoClass: any) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        const dtoObject = plainToInstance(DtoClass, req.body);


        const errors = await validate(dtoObject, {
            whitelist: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
        });

        if (errors.length > 0) {

            const flatten = (errs: ClassValidatorError[]): string[] =>
                errs.reduce<string[]>((acc, err) => {
                    if (err.constraints) {
                        acc.push(...Object.values(err.constraints));
                    }
                    if (err.children?.length) {
                        acc.push(...flatten(err.children));
                    }
                    return acc;
                }, []);

            const details = flatten(errors);


            throw new ValidationError("Validation failed", details);
        }


        req.body = dtoObject;
        next();
    };
};
