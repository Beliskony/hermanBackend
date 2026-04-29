export interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    company: string;
    service: string;
    message: string;
    urgency: string;
}
declare class MailService {
    private transporter;
    constructor();
    verifyConnection(): Promise<boolean>;
    private send;
    generateOTP(): string;
    sendContactConfirmation(form: ContactFormData): Promise<void>;
    sendContactNotificationToAdmin(form: ContactFormData): Promise<void>;
    sendPasswordResetOTP(params: {
        to: string;
        userName: string;
        otpCode: string;
        expiresIn: string;
    }): Promise<void>;
    private infoRow;
    private wrapTemplate;
    private htmlToText;
}
declare const _default: MailService;
export default _default;
//# sourceMappingURL=sendmail.service.d.ts.map