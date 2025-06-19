import mongoose from '../lib/mongoose';

const MitigationActionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  assignedTo: {
    userId: { type: String },
    userEmail: { type: String },
  },
  dueDate: { type: Date },
  status: { 
    type: String, 
    enum: ['Not Started', 'In Progress', 'Completed', 'Overdue'], 
    default: 'Not Started' 
  },
  progress: { type: Number, min: 0, max: 100, default: 0 }, // Percentage complete
  cost: { type: Number },
  effectiveness: { type: Number, min: 1, max: 5 }, // 1-5 scale
  notes: { type: String },
  completedDate: { type: Date },
}, { timestamps: true });

const RiskAssessmentSchema = new mongoose.Schema({
  likelihood: { 
    type: String, 
    enum: ['Very Low', 'Low', 'Medium', 'High', 'Very High'], 
    required: true 
  },
  impact: { 
    type: String, 
    enum: ['Very Low', 'Low', 'Medium', 'High', 'Very High'], 
    required: true 
  },
  score: { type: Number, min: 1, max: 25 }, // Calculated field
  assessedBy: {
    userId: { type: String },
    userEmail: { type: String },
  },
  assessmentDate: { type: Date, default: Date.now },
  rationale: { type: String },
  evidence: { type: String },
}, { timestamps: true });

const RiskSchema = new mongoose.Schema({
  // Basic Information
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: [
      'Strategic', 'Operational', 'Financial', 'Compliance', 'Technology', 
      'Cybersecurity', 'Legal', 'Reputational', 'Environmental', 'Health & Safety',
      'Supply Chain', 'Market', 'Credit', 'Liquidity', 'Other'
    ],
    required: true 
  },
  subcategory: { type: String },
  
  // Ownership & Responsibility
  owner: {
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
  },
  stakeholders: [{
    userId: { type: String },
    userEmail: { type: String },
    role: { type: String }, // e.g., 'Reviewer', 'Approver', 'Implementer'
  }],
  
  // Risk Assessment
  currentAssessment: RiskAssessmentSchema,
  historicalAssessments: [RiskAssessmentSchema],
  
  // Status & Lifecycle
  status: { 
    type: String, 
    enum: ['Identified', 'Assessed', 'Mitigated', 'Monitored', 'Closed', 'Escalated'], 
    default: 'Identified' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  
  // Mitigation
  mitigationActions: [MitigationActionSchema],
  residualRisk: RiskAssessmentSchema, // Risk level after mitigation
  riskAppetite: { 
    type: String, 
    enum: ['Accept', 'Transfer', 'Mitigate', 'Avoid'], 
    default: 'Mitigate' 
  },
  
  // Business Context
  businessUnit: { type: String },
  project: { type: String },
  location: { type: String },
  regulatoryImpact: [{ type: String }], // List of affected regulations
  
  // Financial Impact
  financialImpact: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'USD' },
  },
  
  // Timeline
  identifiedDate: { type: Date, default: Date.now },
  targetResolutionDate: { type: Date },
  nextReviewDate: { type: Date },
  
  // Attachments & Documentation
  attachments: [{ 
    url: String, 
    name: String, 
    uploadedBy: { userId: String, userEmail: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Comments & Collaboration
  comments: [{
    text: { type: String, required: true },
    userId: { type: String },
    userEmail: { type: String },
    date: { type: Date, default: Date.now },
  }],
  
  // Audit Trail
  changeHistory: [{
    userId: { type: String },
    userEmail: { type: String },
    action: { type: String },
    date: { type: Date, default: Date.now },
    details: { type: String },
    previousValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
  }],
  
  // Tags & Classification
  tags: [{ type: String }],
  confidentiality: { 
    type: String, 
    enum: ['Public', 'Internal', 'Confidential', 'Restricted'], 
    default: 'Internal' 
  },
  
  // Integration
  linkedRisks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Risk' }],
  linkedControls: [{ type: String }], // IDs of related controls
  linkedIncidents: [{ type: String }], // IDs of related incidents
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculated risk score
RiskSchema.virtual('riskScore').get(function() {
  if (this.currentAssessment && this.currentAssessment.likelihood && this.currentAssessment.impact) {
    const likelihoodScores = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5 };
    const impactScores = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5 };
    
    const likelihoodScore = likelihoodScores[this.currentAssessment.likelihood] || 3;
    const impactScore = impactScores[this.currentAssessment.impact] || 3;
    
    return likelihoodScore * impactScore;
  }
  return null;
});

// Virtual for risk level based on score
RiskSchema.virtual('riskLevel').get(function() {
  const score = this.riskScore;
  if (!score) return 'Unknown';
  if (score <= 4) return 'Low';
  if (score <= 8) return 'Medium';
  if (score <= 15) return 'High';
  return 'Critical';
});

// Pre-save middleware to calculate risk score
RiskSchema.pre('save', function(next) {
  if (this.currentAssessment && this.currentAssessment.likelihood && this.currentAssessment.impact) {
    const likelihoodScores = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5 };
    const impactScores = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5 };
    
    const likelihoodScore = likelihoodScores[this.currentAssessment.likelihood] || 3;
    const impactScore = impactScores[this.currentAssessment.impact] || 3;
    
    this.currentAssessment.score = likelihoodScore * impactScore;
  }
  next();
});

// Indexes for performance
RiskSchema.index({ status: 1, priority: 1 });
RiskSchema.index({ category: 1, status: 1 });
RiskSchema.index({ owner: 1 });
RiskSchema.index({ 'currentAssessment.score': -1 });
RiskSchema.index({ nextReviewDate: 1 });
RiskSchema.index({ tags: 1 });

export default mongoose.models.Risk || mongoose.model('Risk', RiskSchema); 