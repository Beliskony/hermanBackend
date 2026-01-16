import { IUser } from "../interfaces/IUser";
export declare class UserService {
    private otpStore;
    private transporter;
    constructor();
    register(user: IUser): Promise<import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & IUser & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    login(email: string, password: string): Promise<{
        username: string;
        email: string;
        phoneNumber: string;
        role: "admin" | "normal";
        createdAt?: Date;
        updatedAt?: Date;
        _id: import("mongoose").Types.ObjectId;
        __v: number;
    }>;
    sendPasswordResetOtp(email: string): Promise<void>;
    resetPasswordWithOtp(email: string, otp: string, newPassword: string): Promise<void>;
    private storeOtp;
    private getStoredOtp;
    private deleteOtp;
    private sendEmail;
}
//# sourceMappingURL=user.service.d.ts.map