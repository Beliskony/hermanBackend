import { Schema, Document } from 'mongoose';
export interface IStakeholderInterview extends Document {
    date: Date;
    location: string;
    duration: string;
    stakeholderType: string;
    profile: {
        name: string;
        function: string;
        gender: string;
        ageRange: string;
    };
    consent: {
        confidentiality: boolean;
        notes: boolean;
        recording: boolean;
    };
    responses: Record<string, string>;
    evaluation: {
        quality: number;
        frankness: number;
        relevance: number;
        climate: number;
    };
}
declare const StakeholderInterviewSchema: Schema<IStakeholderInterview, import("mongoose").Model<IStakeholderInterview, any, any, any, (Document<unknown, any, IStakeholderInterview, any, import("mongoose").DefaultSchemaOptions> & IStakeholderInterview & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, IStakeholderInterview, any, import("mongoose").DefaultSchemaOptions> & IStakeholderInterview & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, IStakeholderInterview>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IStakeholderInterview, Document<unknown, {}, IStakeholderInterview, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IStakeholderInterview & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, IStakeholderInterview, Document<unknown, {}, IStakeholderInterview, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IStakeholderInterview & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    date?: import("mongoose").SchemaDefinitionProperty<Date, IStakeholderInterview, Document<unknown, {}, IStakeholderInterview, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IStakeholderInterview & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    location?: import("mongoose").SchemaDefinitionProperty<string, IStakeholderInterview, Document<unknown, {}, IStakeholderInterview, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IStakeholderInterview & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    duration?: import("mongoose").SchemaDefinitionProperty<string, IStakeholderInterview, Document<unknown, {}, IStakeholderInterview, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IStakeholderInterview & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    stakeholderType?: import("mongoose").SchemaDefinitionProperty<string, IStakeholderInterview, Document<unknown, {}, IStakeholderInterview, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IStakeholderInterview & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    profile?: import("mongoose").SchemaDefinitionProperty<{
        name: string;
        function: string;
        gender: string;
        ageRange: string;
    }, IStakeholderInterview, Document<unknown, {}, IStakeholderInterview, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IStakeholderInterview & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    consent?: import("mongoose").SchemaDefinitionProperty<{
        confidentiality: boolean;
        notes: boolean;
        recording: boolean;
    }, IStakeholderInterview, Document<unknown, {}, IStakeholderInterview, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IStakeholderInterview & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    responses?: import("mongoose").SchemaDefinitionProperty<Record<string, string>, IStakeholderInterview, Document<unknown, {}, IStakeholderInterview, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IStakeholderInterview & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    evaluation?: import("mongoose").SchemaDefinitionProperty<{
        quality: number;
        frankness: number;
        relevance: number;
        climate: number;
    }, IStakeholderInterview, Document<unknown, {}, IStakeholderInterview, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IStakeholderInterview & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, IStakeholderInterview>;
export declare const StakeholderInterview: import("mongoose").Model<IStakeholderInterview, {}, {}, {}, Document<unknown, {}, IStakeholderInterview, {}, import("mongoose").DefaultSchemaOptions> & IStakeholderInterview & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IStakeholderInterview>;
export { StakeholderInterviewSchema };
//# sourceMappingURL=StakeholderInterview.model.d.ts.map