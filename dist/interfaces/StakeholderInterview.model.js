"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StakeholderInterviewSchema = exports.StakeholderInterview = void 0;
const mongoose_1 = require("mongoose");
const StakeholderInterviewSchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    location: { type: String, required: true },
    duration: { type: String, required: true },
    stakeholderType: { type: String, required: true },
    profile: {
        name: { type: String, required: true },
        function: { type: String, required: true },
        gender: { type: String, required: true },
        ageRange: { type: String, required: true }
    },
    consent: {
        confidentiality: { type: Boolean, required: true },
        notes: { type: Boolean, required: true },
        recording: { type: Boolean, required: true }
    },
    responses: { type: mongoose_1.Schema.Types.Mixed, required: true },
    evaluation: {
        quality: { type: Number, min: 1, max: 5, required: true },
        frankness: { type: Number, min: 1, max: 5, required: true },
        relevance: { type: Number, min: 1, max: 5, required: true },
        climate: { type: Number, min: 1, max: 5, required: true }
    }
});
exports.StakeholderInterviewSchema = StakeholderInterviewSchema;
exports.StakeholderInterview = (0, mongoose_1.model)('StakeholderInterview', StakeholderInterviewSchema);
//# sourceMappingURL=StakeholderInterview.model.js.map