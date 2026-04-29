import { Schema, Document } from 'mongoose';
export interface IDocumentReview extends Document {
    documentsPresents: Record<string, boolean>;
    documentsAnalysis: Record<string, {
        findings: string;
        rating: 'conforme' | 'partiel' | 'non-conforme' | 'n/a';
    }>;
    documentsManquants: string;
    autresDocuments: string;
}
declare const DocumentReviewSchema: Schema<IDocumentReview, import("mongoose").Model<IDocumentReview, any, any, any, (Document<unknown, any, IDocumentReview, any, import("mongoose").DefaultSchemaOptions> & IDocumentReview & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, IDocumentReview, any, import("mongoose").DefaultSchemaOptions> & IDocumentReview & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, IDocumentReview>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IDocumentReview, Document<unknown, {}, IDocumentReview, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IDocumentReview & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, IDocumentReview, Document<unknown, {}, IDocumentReview, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IDocumentReview & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    documentsPresents?: import("mongoose").SchemaDefinitionProperty<Record<string, boolean>, IDocumentReview, Document<unknown, {}, IDocumentReview, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IDocumentReview & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    documentsAnalysis?: import("mongoose").SchemaDefinitionProperty<Record<string, {
        findings: string;
        rating: "conforme" | "partiel" | "non-conforme" | "n/a";
    }>, IDocumentReview, Document<unknown, {}, IDocumentReview, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IDocumentReview & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    documentsManquants?: import("mongoose").SchemaDefinitionProperty<string, IDocumentReview, Document<unknown, {}, IDocumentReview, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IDocumentReview & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    autresDocuments?: import("mongoose").SchemaDefinitionProperty<string, IDocumentReview, Document<unknown, {}, IDocumentReview, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IDocumentReview & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, IDocumentReview>;
export declare const DocumentReview: import("mongoose").Model<IDocumentReview, {}, {}, {}, Document<unknown, {}, IDocumentReview, {}, import("mongoose").DefaultSchemaOptions> & IDocumentReview & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IDocumentReview>;
export { DocumentReviewSchema };
//# sourceMappingURL=DocumentReview.model.d.ts.map