import { IUser, User } from "../interfaces/IUser";
import { hash, compare } from "bcryptjs";
import nodemailer from "nodemailer";
import jwt, {SignOptions} from "jsonwebtoken";

export class UserService {
    private JWT_SECRET: string;
    private JWT_EXPIRES_IN: string;
    // Exemple simple de stockage OTP en mémoire
    private otpStore: Record<string, { code: string, expiresAt: number }> = {};

    // Nodemailer transporter
    private transporter;

    constructor() {

       this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
       this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

        // Configurer Nodemailer (ici avec SMTP Gmail par exemple)
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true pour 465, false pour les autres ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async register(user: IUser) {
        try {
            const existingUser = await User.findOne({
                $or: [
                    { email: user.email },
                    { phoneNumber: user.phoneNumber },
                    { username: user.username },
                ],
            });

            if (existingUser) {
                throw new Error("User with provided email, phone number, or username already exists");
            }

            const hashedPassword = await hash(user.password, 12);

            const newUser = new User({
                ...user,
                password: hashedPassword,
            });

            await newUser.save();
            return newUser;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async login(email: string, password: string) {
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("User not found");
        }

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
            throw new Error("Invalid password");
        }

        const signOptions: SignOptions = {
          expiresIn: this.JWT_EXPIRES_IN as SignOptions["expiresIn"],
        };


        // Générer un token JWT
        const token = jwt.sign(
            {
                id: user._id.toString(),
                email: user.email,
                username: user.username,
                phoneNumber: user.phoneNumber,
                role: user.role
            },
            this.JWT_SECRET as jwt.Secret,
            signOptions
        );

        const { password: _, ...safeUser } = user.toObject();
        return {user: safeUser, token}
    }

    async sendPasswordResetOtp(email: string): Promise<void> {
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("User not found");
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await this.storeOtp(email, otp, Date.now() + 10 * 60 * 1000);

        await this.sendEmail(
            email,
            "Password Reset OTP",
            `Your OTP code is: ${otp}. It will expire in 10 minutes.`
        );
    }

    async resetPasswordWithOtp(email: string, otp: string, newPassword: string): Promise<void> {
        const storedOtp = await this.getStoredOtp(email);

        if (!storedOtp || storedOtp.code !== otp || storedOtp.expiresAt < Date.now()) {
            throw new Error("Invalid or expired OTP");
        }

        if (newPassword.length < 8) {
            throw new Error("Password must be at least 8 characters");
        }

        const hashedPassword = await hash(newPassword, 12);
        await User.updateOne({ email }, { password: hashedPassword });
        console.log(newPassword);
        

        await this.deleteOtp(email);
    }

    // --------------------- OTP Storage ---------------------
    private async storeOtp(email: string, otp: string, expiresAt: number): Promise<void> {
        this.otpStore[email] = { code: otp, expiresAt };
        console.log(this.otpStore);
        
    }

    private async getStoredOtp(email: string): Promise<{ code: string; expiresAt: number } | null> {
        return this.otpStore[email] || null;
    }

    private async deleteOtp(email: string): Promise<void> {
        delete this.otpStore[email];
    }

    // --------------------- Nodemailer ---------------------
    private async sendEmail(to: string, subject: string, text: string): Promise<void> {
        if (!this.transporter) throw new Error("Email transporter not initialized");

        await this.transporter.sendMail({
            from: process.env.SMTP_USER, // ton email expéditeur
            to,
            subject,
            text,
        });

        console.log(`Email sent to ${to}`);
    }
}

