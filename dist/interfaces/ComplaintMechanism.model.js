"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintMechanismSchema = exports.ComplaintMechanism = void 0;
const mongoose_1 = require("mongoose");
const ComplaintMechanismSchema = new mongoose_1.Schema({
    documentaryBasis: { type: mongoose_1.Schema.Types.Mixed, required: true },
    keyCriteria: { type: mongoose_1.Schema.Types.Mixed, required: true },
    strengths: [{ type: String }],
    weaknesses: [{
            deficiency: { type: String, required: true },
            consequence: { type: String, required: true },
            severity: { type: String, required: true }
        }],
    recommendations: [{
            recommendation: { type: String, required: true },
            priority: { type: String, required: true },
            responsible: { type: String, required: true },
            deadline: { type: String, required: true }
        }],
    globalConclusion: { type: String, required: true }
});
exports.ComplaintMechanismSchema = ComplaintMechanismSchema;
exports.ComplaintMechanism = (0, mongoose_1.model)('ComplaintMechanism', ComplaintMechanismSchema);
//# sourceMappingURL=ComplaintMechanism.model.js.map