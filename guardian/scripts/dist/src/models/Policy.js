"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("../lib/mongoose");
var CommentSchema = new mongoose_1.default.Schema({
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
    userId: { type: String },
    userEmail: { type: String },
});
var PolicySchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    description: { type: String },
    owner: {
        userId: { type: String },
        userEmail: { type: String },
    },
    effectiveDate: { type: Date },
    reviewDate: { type: Date },
    version: { type: String, default: '1.0' },
    category: { type: String },
    attachments: [{ url: String, name: String }], // Array of { url, name }
    state: { type: String, enum: ['Draft', 'Review', 'Approved', 'Rejected'], default: 'Draft' },
    comments: [CommentSchema],
    changeHistory: [{
            userId: { type: String },
            userEmail: { type: String },
            action: { type: String },
            date: { type: Date, default: Date.now },
            details: { type: String },
        }],
}, { timestamps: true });
exports.default = mongoose_1.default.models.Policy || mongoose_1.default.model('Policy', PolicySchema);
