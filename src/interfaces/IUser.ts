import { Schema, model } from 'mongoose';

interface IUser {
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
    role: 'admin' | 'normal'
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: /.+\@.+\..+/,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "normal"
        }
    },
    { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
export type { IUser };