"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const mongoose_1 = require("mongoose");
const EventSchema = new mongoose_1.Schema({
    EventName: { type: String, required: true }
}, {
    timestamps: true // ⬅️ indispensable
});
exports.Event = (0, mongoose_1.model)('Event', EventSchema);
//# sourceMappingURL=IEvent.js.map