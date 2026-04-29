import { Schema, Document } from 'mongoose';
interface InspectionItem {
    status: string;
    observations: string;
    risk: string;
}
export interface IFieldInspection extends Document {
    projectName: string;
    date: Date;
    auditors: string;
    accompaniers: string;
    zones: string[];
    waterManagement: Record<string, InspectionItem>;
    wasteManagement: Record<string, InspectionItem>;
    emissions: Record<string, InspectionItem>;
    healthSafety: Record<string, InspectionItem>;
    community: Record<string, InspectionItem>;
}
declare const FieldInspectionSchema: Schema<IFieldInspection, import("mongoose").Model<IFieldInspection, any, any, any, (Document<unknown, any, IFieldInspection, any, import("mongoose").DefaultSchemaOptions> & IFieldInspection & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, IFieldInspection, any, import("mongoose").DefaultSchemaOptions> & IFieldInspection & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, IFieldInspection>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IFieldInspection, Document<unknown, {}, IFieldInspection, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IFieldInspection & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, IFieldInspection, Document<unknown, {}, IFieldInspection, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IFieldInspection & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    date?: import("mongoose").SchemaDefinitionProperty<Date, IFieldInspection, Document<unknown, {}, IFieldInspection, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IFieldInspection & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    projectName?: import("mongoose").SchemaDefinitionProperty<string, IFieldInspection, Document<unknown, {}, IFieldInspection, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IFieldInspection & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    auditors?: import("mongoose").SchemaDefinitionProperty<string, IFieldInspection, Document<unknown, {}, IFieldInspection, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IFieldInspection & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    accompaniers?: import("mongoose").SchemaDefinitionProperty<string, IFieldInspection, Document<unknown, {}, IFieldInspection, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IFieldInspection & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    zones?: import("mongoose").SchemaDefinitionProperty<string[], IFieldInspection, Document<unknown, {}, IFieldInspection, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IFieldInspection & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    waterManagement?: import("mongoose").SchemaDefinitionProperty<Record<string, InspectionItem>, IFieldInspection, Document<unknown, {}, IFieldInspection, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IFieldInspection & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    wasteManagement?: import("mongoose").SchemaDefinitionProperty<Record<string, InspectionItem>, IFieldInspection, Document<unknown, {}, IFieldInspection, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IFieldInspection & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    emissions?: import("mongoose").SchemaDefinitionProperty<Record<string, InspectionItem>, IFieldInspection, Document<unknown, {}, IFieldInspection, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IFieldInspection & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    healthSafety?: import("mongoose").SchemaDefinitionProperty<Record<string, InspectionItem>, IFieldInspection, Document<unknown, {}, IFieldInspection, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IFieldInspection & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    community?: import("mongoose").SchemaDefinitionProperty<Record<string, InspectionItem>, IFieldInspection, Document<unknown, {}, IFieldInspection, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IFieldInspection & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, IFieldInspection>;
export declare const FieldInspection: import("mongoose").Model<IFieldInspection, {}, {}, {}, Document<unknown, {}, IFieldInspection, {}, import("mongoose").DefaultSchemaOptions> & IFieldInspection & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IFieldInspection>;
export { FieldInspectionSchema };
//# sourceMappingURL=FieldInspection.model.d.ts.map