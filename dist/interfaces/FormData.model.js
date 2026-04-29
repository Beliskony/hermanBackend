"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormData = void 0;
// src/models/FormData.model.ts
const mongoose_1 = require("mongoose");
const ProjectInfo_model_1 = require("./ProjectInfo.model");
const DocumentReview_model_1 = require("./DocumentReview.model");
const FieldInspection_model_1 = require("./FieldInspection.model");
const StakeholderInterview_model_1 = require("./StakeholderInterview.model");
const GenderAssessment_model_1 = require("./GenderAssessment.model");
const ComplaintMechanism_model_1 = require("./ComplaintMechanism.model");
const FormDataSchema = new mongoose_1.Schema({
    projectInfo: { type: ProjectInfo_model_1.ProjectInfoSchema, required: true },
    documentReview: { type: DocumentReview_model_1.DocumentReviewSchema, required: true },
    fieldInspection: { type: FieldInspection_model_1.FieldInspectionSchema, required: true },
    stakeholderInterview: { type: StakeholderInterview_model_1.StakeholderInterviewSchema, required: true },
    genderAssessment: { type: GenderAssessment_model_1.GenderAssessmentSchema, required: true },
    complaintMechanism: { type: ComplaintMechanism_model_1.ComplaintMechanismSchema, required: true },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'archived'],
        default: 'draft'
    },
    submittedAt: { type: Date }
}, {
    timestamps: true // Ajoute automatiquement createdAt et updatedAt
});
// Index pour optimiser les recherches
FormDataSchema.index({ 'projectInfo.projectName': 1 });
FormDataSchema.index({ status: 1 });
FormDataSchema.index({ createdAt: -1 });
exports.FormData = (0, mongoose_1.model)('FormData', FormDataSchema);
//# sourceMappingURL=FormData.model.js.map