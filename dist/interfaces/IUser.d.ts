export interface IUser {
    id: string;
    username: string;
    email: string;
    phone_number: string;
    password: string;
    role: 'admin' | 'user';
    created_at: Date;
    updated_at: Date;
}
export interface ICreateUser {
    username: string;
    email: string;
    phone_number: string;
    password: string;
    role?: 'admin' | 'user';
}
//# sourceMappingURL=IUser.d.ts.map