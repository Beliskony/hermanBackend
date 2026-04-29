import { Schema, Document } from 'mongoose';
export interface IGenderAssessment extends Document {
    objectives: Array<{
        objective: string;
        indicator: string;
        status: string;
    }>;
    quantitativeData: Record<string, {
        women: number;
        men: number;
        other: number;
        source: string;
    }>;
    consultations: Array<{
        group: string;
        sessions: number;
        participants: number;
        method: string;
    }>;
    impacts: {
        environmental: Array<{
            impact: string;
            women: string;
            men: string;
            vulnerable: string;
            severity: string;
        }>;
        socioeconomic: Array<{
            impact: string;
            women: string;
            men: string;
            vulnerable: string;
            opportunity: string;
        }>;
    };
    recommendations: Array<{
        recommendation: string;
        priority: string;
        scope: string;
        responsible: string;
        deadline: string;
    }>;
}
declare const GenderAssessmentSchema: Schema<IGenderAssessment, import("mongoose").Model<IGenderAssessment, any, any, any, (Document<unknown, any, IGenderAssessment, any, import("mongoose").DefaultSchemaOptions> & IGenderAssessment & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, IGenderAssessment, any, import("mongoose").DefaultSchemaOptions> & IGenderAssessment & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, IGenderAssessment>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IGenderAssessment, Document<unknown, {}, IGenderAssessment, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IGenderAssessment & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, IGenderAssessment, Document<unknown, {}, IGenderAssessment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IGenderAssessment & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    objectives?: import("mongoose").SchemaDefinitionProperty<{
        objective: string;
        indicator: string;
        status: string;
    }[], IGenderAssessment, Document<unknown, {}, IGenderAssessment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IGenderAssessment & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    quantitativeData?: import("mongoose").SchemaDefinitionProperty<Record<string, {
        women: number;
        men: number;
        other: number;
        source: string;
    }>, IGenderAssessment, Document<unknown, {}, IGenderAssessment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IGenderAssessment & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    consultations?: import("mongoose").SchemaDefinitionProperty<{
        group: string;
        sessions: number;
        participants: number;
        method: string;
    }[], IGenderAssessment, Document<unknown, {}, IGenderAssessment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IGenderAssessment & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    impacts?: import("mongoose").SchemaDefinitionProperty<{
        environmental: Array<{
            impact: string;
            women: string;
            men: string;
            vulnerable: string;
            severity: string;
        }>;
        socioeconomic: Array<{
            impact: string;
            women: string;
            men: string;
            vulnerable: string;
            opportunity: string;
        }>;
    }, IGenderAssessment, Document<unknown, {}, IGenderAssessment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IGenderAssessment & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    recommendations?: import("mongoose").SchemaDefinitionProperty<{
        recommendation: string;
        priority: string;
        scope: string;
        responsible: string;
        deadline: string;
    }[], IGenderAssessment, Document<unknown, {}, IGenderAssessment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IGenderAssessment & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, IGenderAssessment>;
export declare const GenderAssessment: import("mongoose").Model<IGenderAssessment, {}, {}, {}, Document<unknown, {}, IGenderAssessment, {}, import("mongoose").DefaultSchemaOptions> & IGenderAssessment & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IGenderAssessment>;
export { GenderAssessmentSchema };
//# sourceMappingURL=GenderAssessment.model.d.ts.map