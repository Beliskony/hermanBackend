"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuideEntretienSchema = exports.GuideEntretien = void 0;
const mongoose_1 = require("mongoose");
// ─── SCHEMA ──────────────────────────────────────────────────
const QuestionSchema = new mongoose_1.Schema({
    questionId: { type: String, required: true },
    question: { type: String, required: true },
    reponse: { type: String, default: '' }
}, { _id: false });
const ThemeSchema = new mongoose_1.Schema({
    questions: [QuestionSchema]
}, { _id: false });
const GuideEntretienSchema = new mongoose_1.Schema({
    guideType: {
        type: String,
        enum: [
            'autorites_locales',
            'riverains_communaute',
            'travailleurs_chantier',
            'maitrise_ouvrage_entreprise',
            'direction_cfpt'
        ],
        required: true
    },
    subprojet: { type: String, required: true },
    generalInfo: {
        nom: { type: String, required: true },
        fonction: { type: String, required: true },
        contact: { type: String, default: '' },
        date: { type: Date, required: true },
        lieu: { type: String, required: true },
        typeEntretien: { type: String, enum: ['individuel', 'focus_group'] },
        employeur: { type: String },
        typeContrat: { type: String, enum: ['cdd', 'journalier', 'interimaire'] }
    },
    theme1: { type: ThemeSchema, required: true },
    theme2: {
        questions: [{
                questionId: { type: String, required: true },
                question: { type: String, required: true },
                reponse: { type: String, default: '' },
                nuisancesObservees: {
                    poussiere: { type: Boolean },
                    bruit: { type: Boolean },
                    circulation: { type: Boolean },
                    odeurs: { type: Boolean },
                    dechets: { type: Boolean }
                }
            }]
    },
    theme3: { type: ThemeSchema, required: true },
    theme4: { type: ThemeSchema },
    notesAuditeur: { type: String, default: '' }
}, { timestamps: true });
exports.GuideEntretienSchema = GuideEntretienSchema;
// Index utiles
GuideEntretienSchema.index({ guideType: 1 });
GuideEntretienSchema.index({ subprojet: 1 });
GuideEntretienSchema.index({ 'generalInfo.date': -1 });
exports.GuideEntretien = (0, mongoose_1.model)('GuideEntretien', GuideEntretienSchema);
//# sourceMappingURL=GuideEntretien.model.js.map