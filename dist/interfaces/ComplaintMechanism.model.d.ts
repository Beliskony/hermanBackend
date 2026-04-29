import { Schema, Document } from 'mongoose';
export interface IComplaintMechanism extends Document {
    documentaryBasis: Record<string, {
        finding: string;
        evidence: string;
        evaluation: string;
    }>;
    keyCriteria: Record<string, {
        findings: string;
        evaluation: string;
    }>;
    strengths: string[];
    weaknesses: Array<{
        deficiency: string;
        consequence: string;
        severity: string;
    }>;
    recommendations: Array<{
        recommendation: string;
        priority: string;
        responsible: string;
        deadline: string;
    }>;
    globalConclusion: string;
}
declare const ComplaintMechanismSchema: Schema<IComplaintMechanism, import("mongoose").Model<IComplaintMechanism, any, any, any, (Document<unknown, any, IComplaintMechanism, any, import("mongoose").DefaultSchemaOptions> & IComplaintMechanism & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, IComplaintMechanism, any, import("mongoose").DefaultSchemaOptions> & IComplaintMechanism & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, IComplaintMechanism>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IComplaintMechanism, Document<unknown, {}, IComplaintMechanism, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IComplaintMechanism & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, IComplaintMechanism, Document<unknown, {}, IComplaintMechanism, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IComplaintMechanism & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    recommendations?: import("mongoose").SchemaDefinitionProperty<{
        recommendation: string;
        priority: string;
        responsible: string;
        deadline: string;
    }[], IComplaintMechanism, Document<unknown, {}, IComplaintMechanism, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IComplaintMechanism & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    documentaryBasis?: import("mongoose").SchemaDefinitionProperty<Record<string, {
        finding: string;
        evidence: string;
        evaluation: string;
    }>, IComplaintMechanism, Document<unknown, {}, IComplaintMechanism, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IComplaintMechanism & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    keyCriteria?: import("mongoose").SchemaDefinitionProperty<Record<string, {
        findings: string;
        evaluation: string;
    }>, IComplaintMechanism, Document<unknown, {}, IComplaintMechanism, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IComplaintMechanism & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    strengths?: import("mongoose").SchemaDefinitionProperty<string[], IComplaintMechanism, Document<unknown, {}, IComplaintMechanism, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IComplaintMechanism & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    weaknesses?: import("mongoose").SchemaDefinitionProperty<{
        deficiency: string;
        consequence: string;
        severity: string;
    }[], IComplaintMechanism, Document<unknown, {}, IComplaintMechanism, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IComplaintMechanism & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    globalConclusion?: import("mongoose").SchemaDefinitionProperty<string, IComplaintMechanism, Document<unknown, {}, IComplaintMechanism, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IComplaintMechanism & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, IComplaintMechanism>;
export declare const ComplaintMechanism: import("mongoose").Model<IComplaintMechanism, {}, {}, {}, Document<unknown, {}, IComplaintMechanism, {}, import("mongoose").DefaultSchemaOptions> & IComplaintMechanism & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IComplaintMechanism>;
export { ComplaintMechanismSchema };
//# sourceMappingURL=ComplaintMechanism.model.d.ts.map