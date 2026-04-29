"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectInfoSchema = exports.ProjectInfo = void 0;
const mongoose_1 = require("mongoose");
const ProjectInfoSchema = new mongoose_1.Schema({
    projectName: { type: String, required: true },
    date: { type: Date, required: true },
    auditors: { type: String, required: true },
    location: { type: String, required: true },
    period: { type: String, required: true }
});
exports.ProjectInfoSchema = ProjectInfoSchema;
exports.ProjectInfo = (0, mongoose_1.model)('ProjectInfo', ProjectInfoSchema);
//# sourceMappingURL=ProjectInfo.model.js.map