"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistConducteurTravauxSchema = exports.ChecklistAuditSchema = exports.ChecklistConducteurTravaux = exports.ChecklistAudit = void 0;
const mongoose_1 = require("mongoose");
// ─── SCHEMAS ─────────────────────────────────────────────────
const CritereItemSchema = new mongoose_1.Schema({
    numero: { type: String, required: true },
    critere: { type: String, required: true },
    sourcesMethode: { type: String, default: '' },
    conformite: { type: String, enum: ['O', 'N', 'P', 'S.O.'], default: 'S.O.' },
    observations: { type: String, default: '' },
    risqueNonConformite: { type: String, default: '' }
}, { _id: false });
const DocumentItemSchema = new mongoose_1.Schema({
    numero: { type: String, required: true },
    document: { type: String, required: true },
    disponible: { type: String, enum: ['O', 'N', 'P', 'S.O.'], default: 'S.O.' },
    commentaires: { type: String, default: '' }
}, { _id: false });
const ChecklistAuditSchema = new mongoose_1.Schema({
    subprojet: { type: String, required: true },
    auditeurs: { type: String, required: true },
    date: { type: Date, required: true },
    section1_cadreJuridique: [CritereItemSchema],
    section2_infraSecurite: {
        stabiliteStructure: [CritereItemSchema],
        securiteIncendie: [CritereItemSchema],
        accessibilitePMR: [CritereItemSchema]
    },
    section3_gestionEnvSociale: {
        gestionDechets: [CritereItemSchema],
        nuisancesPollution: [CritereItemSchema],
        santeSecuteTravailleurs: [CritereItemSchema]
    },
    section4_gestionSociale: {
        relationsCommunautes: [CritereItemSchema],
        mgp: [CritereItemSchema]
    },
    section5_risquesERP: {
        securiteSurete: [CritereItemSchema],
        hygieneEnvironnement: [CritereItemSchema]
    },
    section6_bilanDocumentaire: [DocumentItemSchema],
    synthese: {
        nombreNonConformitesMajeures: { type: Number, default: 0 },
        domainesCritiques: { type: String, default: '' },
        signatureAuditeur: { type: String, default: '' }
    }
}, { timestamps: true });
exports.ChecklistAuditSchema = ChecklistAuditSchema;
// ─────────────────────────────────────────────────────────────
const QuestionConducteurSchema = new mongoose_1.Schema({
    numero: { type: String, required: true },
    question: { type: String, required: true },
    reponse: { type: String, default: '' },
    reponseBooleenne: { type: String, enum: ['oui', 'non', 'partiellement', 'nsp', 'sans_objet'] },
    observations: { type: String, default: '' }
}, { _id: false });
const ChecklistConducteurTravauxSchema = new mongoose_1.Schema({
    subprojet: { type: String, required: true },
    auditeur: { type: String, required: true },
    date: { type: Date, required: true },
    personneRencontree: { type: String, required: true },
    fonction: { type: String, required: true },
    entreprise: { type: String, required: true },
    contact: { type: String, default: '' },
    dureeEntretien: { type: String, default: '' },
    lieu: { type: String, required: true },
    section1_infoGenerales: [QuestionConducteurSchema],
    section2_processusInitialT1: [QuestionConducteurSchema],
    section3_installationT2: [QuestionConducteurSchema],
    section4_recrutementT2: [QuestionConducteurSchema],
    section5_hseT2: [QuestionConducteurSchema],
    section6_gestionEnvT2: [QuestionConducteurSchema],
    section7_sensibilisationT2: [QuestionConducteurSchema],
    section8_mgpT2: [QuestionConducteurSchema],
    section9_fermetureT2: [QuestionConducteurSchema],
    section10_exploitationT3: [QuestionConducteurSchema],
    section11_synthese: [QuestionConducteurSchema],
    commentairesLibres: { type: String, default: '' },
    signatureAuditeur: { type: String, default: '' }
}, { timestamps: true });
exports.ChecklistConducteurTravauxSchema = ChecklistConducteurTravauxSchema;
// Index
ChecklistAuditSchema.index({ subprojet: 1 });
ChecklistAuditSchema.index({ date: -1 });
ChecklistConducteurTravauxSchema.index({ subprojet: 1 });
ChecklistConducteurTravauxSchema.index({ entreprise: 1 });
ChecklistConducteurTravauxSchema.index({ date: -1 });
// ─── MODELS ──────────────────────────────────────────────────
exports.ChecklistAudit = (0, mongoose_1.model)('ChecklistAudit', ChecklistAuditSchema);
exports.ChecklistConducteurTravaux = (0, mongoose_1.model)('ChecklistConducteurTravaux', ChecklistConducteurTravauxSchema);
//# sourceMappingURL=ChecklistAudit.model.js.map