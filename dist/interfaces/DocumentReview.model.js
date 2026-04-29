"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentReviewSchema = exports.DocumentReview = void 0;
const mongoose_1 = require("mongoose");
const DocumentReviewSchema = new mongoose_1.Schema({
    documentsPresents: { type: mongoose_1.Schema.Types.Mixed, required: true },
    documentsAnalysis: { type: mongoose_1.Schema.Types.Mixed, required: true },
    documentsManquants: { type: String, default: '' },
    autresDocuments: { type: String, default: '' }
});
exports.DocumentReviewSchema = DocumentReviewSchema;
exports.DocumentReview = (0, mongoose_1.model)('DocumentReview', DocumentReviewSchema);
//# sourceMappingURL=DocumentReview.model.js.map