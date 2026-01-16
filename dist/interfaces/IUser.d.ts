interface IUser {
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
    role: 'admin' | 'normal';
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const User: import("mongoose").Model<IUser, {}, {}, {}, import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & IUser & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export type { IUser };
//# sourceMappingURL=IUser.d.ts.map