import { Schema, Document } from 'mongoose';
export type Conformite = 'O' | 'N' | 'P' | 'S.O.';
interface CritereItem {
    numero: string;
    critere: string;
    sourcesMethode: string;
    conformite: Conformite;
    observations: string;
    risqueNonConformite: string;
}
interface DocumentItem {
    numero: string;
    document: string;
    disponible: Conformite;
    commentaires: string;
}
export interface IChecklistAudit extends Document {
    subprojet: string;
    auditeurs: string;
    date: Date;
    section1_cadreJuridique: CritereItem[];
    section2_infraSecurite: {
        stabiliteStructure: CritereItem[];
        securiteIncendie: CritereItem[];
        accessibilitePMR: CritereItem[];
    };
    section3_gestionEnvSociale: {
        gestionDechets: CritereItem[];
        nuisancesPollution: CritereItem[];
        santeSecuteTravailleurs: CritereItem[];
    };
    section4_gestionSociale: {
        relationsCommunautes: CritereItem[];
        mgp: CritereItem[];
    };
    section5_risquesERP: {
        securiteSurete: CritereItem[];
        hygieneEnvironnement: CritereItem[];
    };
    section6_bilanDocumentaire: DocumentItem[];
    synthese: {
        nombreNonConformitesMajeures: number;
        domainesCritiques: string;
        signatureAuditeur: string;
    };
}
export type ReponseOuiNon = 'oui' | 'non' | 'partiellement' | 'nsp' | 'sans_objet';
interface QuestionConducteur {
    numero: string;
    question: string;
    reponse: string;
    reponseBooleenne?: ReponseOuiNon;
    observations?: string;
}
export interface IChecklistConducteurTravaux extends Document {
    subprojet: string;
    auditeur: string;
    date: Date;
    personneRencontree: string;
    fonction: string;
    entreprise: string;
    contact: string;
    dureeEntretien: string;
    lieu: string;
    section1_infoGenerales: QuestionConducteur[];
    section2_processusInitialT1: QuestionConducteur[];
    section3_installationT2: QuestionConducteur[];
    section4_recrutementT2: QuestionConducteur[];
    section5_hseT2: QuestionConducteur[];
    section6_gestionEnvT2: QuestionConducteur[];
    section7_sensibilisationT2: QuestionConducteur[];
    section8_mgpT2: QuestionConducteur[];
    section9_fermetureT2: QuestionConducteur[];
    section10_exploitationT3: QuestionConducteur[];
    section11_synthese: QuestionConducteur[];
    commentairesLibres?: string;
    signatureAuditeur?: string;
}
declare const ChecklistAuditSchema: Schema<IChecklistAudit, import("mongoose").Model<IChecklistAudit, any, any, any, (Document<unknown, any, IChecklistAudit, any, import("mongoose").DefaultSchemaOptions> & IChecklistAudit & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, IChecklistAudit, any, import("mongoose").DefaultSchemaOptions> & IChecklistAudit & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, IChecklistAudit>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IChecklistAudit, Document<unknown, {}, IChecklistAudit, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistAudit & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, IChecklistAudit, Document<unknown, {}, IChecklistAudit, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistAudit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    date?: import("mongoose").SchemaDefinitionProperty<Date, IChecklistAudit, Document<unknown, {}, IChecklistAudit, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistAudit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    subprojet?: import("mongoose").SchemaDefinitionProperty<string, IChecklistAudit, Document<unknown, {}, IChecklistAudit, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistAudit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    auditeurs?: import("mongoose").SchemaDefinitionProperty<string, IChecklistAudit, Document<unknown, {}, IChecklistAudit, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistAudit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    section1_cadreJuridique?: import("mongoose").SchemaDefinitionProperty<CritereItem[], IChecklistAudit, Document<unknown, {}, IChecklistAudit, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistAudit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    section2_infraSecurite?: import("mongoose").SchemaDefinitionProperty<{
        stabiliteStructure: CritereItem[];
        securiteIncendie: CritereItem[];
        accessibilitePMR: CritereItem[];
    }, IChecklistAudit, Document<unknown, {}, IChecklistAudit, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistAudit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    section3_gestionEnvSociale?: import("mongoose").SchemaDefinitionProperty<{
        gestionDechets: CritereItem[];
        nuisancesPollution: CritereItem[];
        santeSecuteTravailleurs: CritereItem[];
    }, IChecklistAudit, Document<unknown, {}, IChecklistAudit, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistAudit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    section4_gestionSociale?: import("mongoose").SchemaDefinitionProperty<{
        relationsCommunautes: CritereItem[];
        mgp: CritereItem[];
    }, IChecklistAudit, Document<unknown, {}, IChecklistAudit, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistAudit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    section5_risquesERP?: import("mongoose").SchemaDefinitionProperty<{
        securiteSurete: CritereItem[];
        hygieneEnvironnement: CritereItem[];
    }, IChecklistAudit, Document<unknown, {}, IChecklistAudit, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistAudit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    section6_bilanDocumentaire?: import("mongoose").SchemaDefinitionProperty<DocumentItem[], IChecklistAudit, Document<unknown, {}, IChecklistAudit, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistAudit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    synthese?: import("mongoose").SchemaDefinitionProperty<{
        nombreNonConformitesMajeures: number;
        domainesCritiques: string;
        signatureAuditeur: string;
    }, IChecklistAudit, Document<unknown, {}, IChecklistAudit, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistAudit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, IChecklistAudit>;
declare const ChecklistConducteurTravauxSchema: Schema<IChecklistConducteurTravaux, import("mongoose").Model<IChecklistConducteurTravaux, any, any, any, (Document<unknown, any, IChecklistConducteurTravaux, any, import("mongoose").DefaultSchemaOptions> & IChecklistConducteurTravaux & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, IChecklistConducteurTravaux, any, import("mongoose").DefaultSchemaOptions> & IChecklistConducteurTravaux & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, IChecklistConducteurTravaux>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    date?: import("mongoose").SchemaDefinitionProperty<Date, IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    subprojet?: import("mongoose").SchemaDefinitionProperty<string, IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    fonction?: import("mongoose").SchemaDefinitionProperty<string, IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    contact?: import("mongoose").SchemaDefinitionProperty<string, IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    lieu?: import("mongoose").SchemaDefinitionProperty<string, IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    signatureAuditeur?: import("mongoose").SchemaDefinitionProperty<string | undefined, IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    auditeur?: import("mongoose").SchemaDefinitionProperty<string, IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    personneRencontree?: import("mongoose").SchemaDefinitionProperty<string, IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    entreprise?: import("mongoose").SchemaDefinitionProperty<string, IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    dureeEntretien?: import("mongoose").SchemaDefinitionProperty<string, IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    section1_infoGenerales?: import("mongoose").SchemaDefinitionProperty<QuestionConducteur[], IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    section2_processusInitialT1?: import("mongoose").SchemaDefinitionProperty<QuestionConducteur[], IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    section3_installationT2?: import("mongoose").SchemaDefinitionProperty<QuestionConducteur[], IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    section4_recrutementT2?: import("mongoose").SchemaDefinitionProperty<QuestionConducteur[], IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    section5_hseT2?: import("mongoose").SchemaDefinitionProperty<QuestionConducteur[], IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    section6_gestionEnvT2?: import("mongoose").SchemaDefinitionProperty<QuestionConducteur[], IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    section7_sensibilisationT2?: import("mongoose").SchemaDefinitionProperty<QuestionConducteur[], IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    section8_mgpT2?: import("mongoose").SchemaDefinitionProperty<QuestionConducteur[], IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    section9_fermetureT2?: import("mongoose").SchemaDefinitionProperty<QuestionConducteur[], IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    section10_exploitationT3?: import("mongoose").SchemaDefinitionProperty<QuestionConducteur[], IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    section11_synthese?: import("mongoose").SchemaDefinitionProperty<QuestionConducteur[], IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    commentairesLibres?: import("mongoose").SchemaDefinitionProperty<string | undefined, IChecklistConducteurTravaux, Document<unknown, {}, IChecklistConducteurTravaux, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<IChecklistConducteurTravaux & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, IChecklistConducteurTravaux>;
export declare const ChecklistAudit: import("mongoose").Model<IChecklistAudit, {}, {}, {}, Document<unknown, {}, IChecklistAudit, {}, import("mongoose").DefaultSchemaOptions> & IChecklistAudit & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IChecklistAudit>;
export declare const ChecklistConducteurTravaux: import("mongoose").Model<IChecklistConducteurTravaux, {}, {}, {}, Document<unknown, {}, IChecklistConducteurTravaux, {}, import("mongoose").DefaultSchemaOptions> & IChecklistConducteurTravaux & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IChecklistConducteurTravaux>;
export { ChecklistAuditSchema, ChecklistConducteurTravauxSchema };
//# sourceMappingURL=ChecklistAudit.model.d.ts.map