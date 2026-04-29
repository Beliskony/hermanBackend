"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenderAssessmentSchema = exports.GenderAssessment = void 0;
const mongoose_1 = require("mongoose");
const GenderAssessmentSchema = new mongoose_1.Schema({
    objectives: [{
            objective: { type: String, required: true },
            indicator: { type: String, required: true },
            status: { type: String, required: true }
        }],
    quantitativeData: { type: mongoose_1.Schema.Types.Mixed, required: true },
    consultations: [{
            group: { type: String, required: true },
            sessions: { type: Number, required: true },
            participants: { type: Number, required: true },
            method: { type: String, required: true }
        }],
    impacts: {
        environmental: [{
                impact: { type: String, required: true },
                women: { type: String, required: true },
                men: { type: String, required: true },
                vulnerable: { type: String, required: true },
                severity: { type: String, required: true }
            }],
        socioeconomic: [{
                impact: { type: String, required: true },
                women: { type: String, required: true },
                men: { type: String, required: true },
                vulnerable: { type: String, required: true },
                opportunity: { type: String, required: true }
            }]
    },
    recommendations: [{
            recommendation: { type: String, required: true },
            priority: { type: String, required: true },
            scope: { type: String, required: true },
            responsible: { type: String, required: true },
            deadline: { type: String, required: true }
        }]
});
exports.GenderAssessmentSchema = GenderAssessmentSchema;
exports.GenderAssessment = (0, mongoose_1.model)('GenderAssessment', GenderAssessmentSchema);
//# sourceMappingURL=GenderAssessment.model.js.map