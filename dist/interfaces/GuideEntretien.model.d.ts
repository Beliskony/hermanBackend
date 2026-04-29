import { Schema, Document } from 'mongoose';
export type GuideType = 'autorites_locales' | 'riverains_communaute' | 'travailleurs_chantier' | 'maitrise_ouvrage_entreprise' | 'direction_cfpt';
export interface IGuideEntretien extends Document {
    guideType: GuideType;
    subprojet: string;
    generalInfo: {
        nom: string;
        fonction: string;
        contact: string;
        date: Date;
        lieu: string;
        typeEntretien?: 'individuel' | 'focus_group';
        employeur?: string;
        typeContrat?: 'cdd' | 'journalier' | 'interimaire';
    };
    theme1: {
        questions: Array<{
            questionId: string;
            question: string;
            reponse: string;
        }>;
    };
    theme2: {
        questions: Array<{
            questionId: string;
            question: string;
            reponse: string;
            nuisancesObservees?: {
                poussiere: boolean;
                bruit: boolean;
                circulation: boolean;
                odeurs: boolean;
                dechets: boolean;
            };
        }>;
    };
    theme3: {
        questions: Array<{
            questionId: string;
            question: string;
            reponse: string;
        }>;
    };
    theme4?: {
        questions: Array<{
            questionId: string;
            question: string;
            reponse: string;
        }>;
    };
    notesAuditeur?: string;
}
declare const GuideEntretienSchema: Schema<IGuideEntretien, import("mongoose").Model<IGuideEntretien, any, any, any, (Document<unknown, any, IGuideEntretien, any, import("mongoose").DefaultSchemaOptions> & IGuideEntretien & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, IGuideEntretien, any, import("mongoose").DefaultSchemaOptions> & IGuideEntretien & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, IGuideEntretien>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IGuideEntretien, Document<unknown, {}, IGuideEntretien, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IGuideEntretien & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, IGuideEntretien, Document<unknown, {}, IGuideEntretien, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IGuideEntretien & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    guideType?: import("mongoose").SchemaDefinitionProperty<GuideType, IGuideEntretien, Document<unknown, {}, IGuideEntretien, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IGuideEntretien & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    subprojet?: import("mongoose").SchemaDefinitionProperty<string, IGuideEntretien, Document<unknown, {}, IGuideEntretien, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IGuideEntretien & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    generalInfo?: import("mongoose").SchemaDefinitionProperty<{
        nom: string;
        fonction: string;
        contact: string;
        date: Date;
        lieu: string;
        typeEntretien?: "individuel" | "focus_group";
        employeur?: string;
        typeContrat?: "cdd" | "journalier" | "interimaire";
    }, IGuideEntretien, Document<unknown, {}, IGuideEntretien, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IGuideEntretien & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    theme1?: import("mongoose").SchemaDefinitionProperty<{
        questions: Array<{
            questionId: string;
            question: string;
            reponse: string;
        }>;
    }, IGuideEntretien, Document<unknown, {}, IGuideEntretien, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IGuideEntretien & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    theme2?: import("mongoose").SchemaDefinitionProperty<{
        questions: Array<{
            questionId: string;
            question: string;
            reponse: string;
            nuisancesObservees?: {
                poussiere: boolean;
                bruit: boolean;
                circulation: boolean;
                odeurs: boolean;
                dechets: boolean;
            };
        }>;
    }, IGuideEntretien, Document<unknown, {}, IGuideEntretien, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IGuideEntretien & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    theme3?: import("mongoose").SchemaDefinitionProperty<{
        questions: Array<{
            questionId: string;
            question: string;
            reponse: string;
        }>;
    }, IGuideEntretien, Document<unknown, {}, IGuideEntretien, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IGuideEntretien & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    theme4?: import("mongoose").SchemaDefinitionProperty<{
        questions: Array<{
            questionId: string;
            question: string;
            reponse: string;
        }>;
    } | undefined, IGuideEntretien, Document<unknown, {}, IGuideEntretien, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IGuideEntretien & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    notesAuditeur?: import("mongoose").SchemaDefinitionProperty<string | undefined, IGuideEntretien, Document<unknown, {}, IGuideEntretien, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IGuideEntretien & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, IGuideEntretien>;
export declare const GuideEntretien: import("mongoose").Model<IGuideEntretien, {}, {}, {}, Document<unknown, {}, IGuideEntretien, {}, import("mongoose").DefaultSchemaOptions> & IGuideEntretien & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IGuideEntretien>;
export { GuideEntretienSchema };
//# sourceMappingURL=GuideEntretien.model.d.ts.map