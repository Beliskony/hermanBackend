"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldInspectionSchema = exports.FieldInspection = void 0;
const mongoose_1 = require("mongoose");
const InspectionItemSchema = new mongoose_1.Schema({
    status: { type: String, required: true },
    observations: { type: String, required: true },
    risk: { type: String, required: true }
}, { _id: false });
const FieldInspectionSchema = new mongoose_1.Schema({
    projectName: { type: String, required: true },
    date: { type: Date, required: true },
    auditors: { type: String, required: true },
    accompaniers: { type: String, default: '' },
    zones: [{ type: String }],
    waterManagement: { type: mongoose_1.Schema.Types.Mixed, required: true },
    wasteManagement: { type: mongoose_1.Schema.Types.Mixed, required: true },
    emissions: { type: mongoose_1.Schema.Types.Mixed, required: true },
    healthSafety: { type: mongoose_1.Schema.Types.Mixed, required: true },
    community: { type: mongoose_1.Schema.Types.Mixed, required: true }
});
exports.FieldInspectionSchema = FieldInspectionSchema;
exports.FieldInspection = (0, mongoose_1.model)('FieldInspection', FieldInspectionSchema);
//# sourceMappingURL=FieldInspection.model.js.map