import mongoose from '../lib/mongoose';

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
  userId: { type: String },
  userEmail: { type: String },
});

const PolicySchema = new mongoose.Schema({
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

export default mongoose.models.Policy || mongoose.model('Policy', PolicySchema); 