"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Poll = void 0;
const mongoose_1 = require("mongoose");
const PollSchema = new mongoose_1.Schema({
    eventName: { type: String, required: true }, // Nom de l'événement
    name: { type: String, required: true },
    phone: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    feedback: { type: String, required: true, maxlength: 500 },
    submittedAt: { type: Date, default: Date.now },
});
exports.Poll = (0, mongoose_1.model)('Poll', PollSchema);
//# sourceMappingURL=IPoll.js.map