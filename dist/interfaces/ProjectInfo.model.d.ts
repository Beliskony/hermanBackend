import { Schema, Document } from 'mongoose';
export interface IProjectInfo extends Document {
    projectName: string;
    date: Date;
    auditors: string;
    location: string;
    period: string;
}
declare const ProjectInfoSchema: Schema<IProjectInfo, import("mongoose").Model<IProjectInfo, any, any, any, (Document<unknown, any, IProjectInfo, any, import("mongoose").DefaultSchemaOptions> & IProjectInfo & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, IProjectInfo, any, import("mongoose").DefaultSchemaOptions> & IProjectInfo & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, IProjectInfo>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IProjectInfo, Document<unknown, {}, IProjectInfo, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IProjectInfo & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, IProjectInfo, Document<unknown, {}, IProjectInfo, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IProjectInfo & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    date?: import("mongoose").SchemaDefinitionProperty<Date, IProjectInfo, Document<unknown, {}, IProjectInfo, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IProjectInfo & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    projectName?: import("mongoose").SchemaDefinitionProperty<string, IProjectInfo, Document<unknown, {}, IProjectInfo, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IProjectInfo & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    auditors?: import("mongoose").SchemaDefinitionProperty<string, IProjectInfo, Document<unknown, {}, IProjectInfo, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IProjectInfo & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    location?: import("mongoose").SchemaDefinitionProperty<string, IProjectInfo, Document<unknown, {}, IProjectInfo, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IProjectInfo & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    period?: import("mongoose").SchemaDefinitionProperty<string, IProjectInfo, Document<unknown, {}, IProjectInfo, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IProjectInfo & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, IProjectInfo>;
export declare const ProjectInfo: import("mongoose").Model<IProjectInfo, {}, {}, {}, Document<unknown, {}, IProjectInfo, {}, import("mongoose").DefaultSchemaOptions> & IProjectInfo & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProjectInfo>;
export { ProjectInfoSchema };
//# sourceMappingURL=ProjectInfo.model.d.ts.map