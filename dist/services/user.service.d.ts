import { IUser } from '../interfaces/IUser';
export declare class UserService {
    private JWT_SECRET;
    private JWT_EXPIRES_IN;
    private otpStore;
    constructor();
    register(user: IUser): Promise<{
        id: string;
        username: string;
        email: string;
        role: "user" | "admin";
    }>;
    login(email: string, password: string): Promise<{
        user: {
            id: string;
            username: string;
            email: string;
            phone_number: string;
            role: "user" | "admin";
            created_at: Date;
            updated_at: Date;
        };
        token: string;
    }>;
    sendPasswordResetOtp(email: string): Promise<void>;
    resetPasswordWithOtp(email: string, otp: string, newPassword: string): Promise<void>;
    private storeOtp;
    private getStoredOtp;
    private deleteOtp;
}
//# sourceMappingURL=user.service.d.ts.map