import { Request, Response, NextFunction } from "express";
import { changePasswordService, generateResetToken, getUserProfileService, loginService, refreshAccessTokenService, resetPassword, verifyEmailService, signUpService } from "../services/auth.service";
import { tokenStoredCookie } from "../utils/helper";
import { ChangePasswordDto, CreateUserDto, LoginDto } from "../dtos/user.dto";
import { NotFoundError } from "../utils/errors";

export async function loginController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = req.body as LoginDto;
    const { statusCode, data } = await loginService(dto)
    tokenStoredCookie(res, data.refreshToken)
    res.status(statusCode).json(data?.accessToken)
}

export async function refreshAccessTokenController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = req.cookies.refreshToken;
    const { statusCode, data } = await refreshAccessTokenService(token);
    tokenStoredCookie(res, data.refreshToken);
    res.status(statusCode).json(data.refreshToken)

}
export const resetPasswordController = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { token, newPassword } = req.body as {
        token: string;
        newPassword: string;
    };

    const { success, message } = await resetPassword(token, newPassword);

    if (!success) {
        res.status(400).json({ message });
        return;
    }

    res.status(200).json({ message: "Password reset successful" });
};

export const changePasswordController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const dto = req.body as ChangePasswordDto;

    if (!req.user?.sub) {
        throw new NotFoundError("User");
    }
    const userId = Number(req.user.sub);
    const { statusCode, message } = await changePasswordService(userId, dto);
    res.status(statusCode).json({ message });

};


export const getProfileController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {

    const userId = req?.user?.sub;
    const { statusCode, data } = await getUserProfileService(userId!);
    res.status(statusCode).json(data);

};



export const verifyEmailController = async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
        return res
            .status(400)
            .json({ statusCode: 400, message: "Token manquant ou invalide" });
    }

    const { statusCode, message } = await verifyEmailService(token);

    res.status(statusCode).json({ message });
};

export const forgotPasswordController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { email } = req.body;
    const token = await generateResetToken(email);

    if (!token) {
        throw new NotFoundError("User")
    }

    //await sendResetPasswordEmail(email, token);

    res.status(200).json({ statusCode: 200, message: "un email est envoyé" });

};

export const signUpController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const dto = req.body as CreateUserDto;
    const { statusCode, data, message } = await signUpService(dto);
    res.status(statusCode).json({ data, message });
};

