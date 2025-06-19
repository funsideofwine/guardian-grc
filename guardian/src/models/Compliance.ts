import mongoose from '../lib/mongoose';

const RequirementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  reference: { type: String }, // Regulatory reference number
  category: { type: String },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['Compliant', 'Non-Compliant', 'Partially Compliant', 'Under Review'], 
    default: 'Under Review' 
  },
  evidence: [{ 
    description: String,
    url: String,
    uploadedBy: { userId: String, userEmail: String },
    uploadedAt: { type: Date, default: Date.now },
    reviewedBy: { userId: String, userEmail: String },
    reviewedAt: Date,
    status: { 
      type: String, 
      enum: ['Pending', 'Approved', 'Rejected'], 
      default: 'Pending' 
    }
  }],
  controls: [{ type: String }], // IDs of related controls
  lastReviewDate: { type: Date },
  nextReviewDate: { type: Date },
  notes: { type: String },
}, { timestamps: true });

const GapSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement' },
  severity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    required: true 
  },
  impact: { type: String },
  remediationPlan: { type: String },
  assignedTo: {
    userId: { type: String },
    userEmail: { type: String },
  },
  dueDate: { type: Date },
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'], 
    default: 'Open' 
  },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  cost: { type: Number },
  completedDate: { type: Date },
  notes: { type: String },
}, { timestamps: true });

const AuditFindingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    required: true 
  },
  category: { type: String },
  requirementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement' },
  evidence: [{ 
    description: String,
    url: String,
    uploadedBy: { userId: String, userEmail: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  remediationPlan: { type: String },
  assignedTo: {
    userId: { type: String },
    userEmail: { type: String },
  },
  dueDate: { type: Date },
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'], 
    default: 'Open' 
  },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  completedDate: { type: Date },
  notes: { type: String },
}, { timestamps: true });

const ComplianceSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['Regulation', 'Standard', 'Framework', 'Policy'], 
    required: true 
  },
  category: { 
    type: String, 
    enum: [
      'Data Protection', 'Cybersecurity', 'Financial', 'Environmental', 
      'Health & Safety', 'Quality Management', 'Information Security',
      'Business Continuity', 'Risk Management', 'Other'
    ],
    required: true 
  },
  
  // Regulatory Information
  jurisdiction: { type: String }, // e.g., 'EU', 'US', 'Global'
  authority: { type: String }, // e.g., 'GDPR', 'ISO', 'NIST'
  version: { type: String },
  effectiveDate: { type: Date },
  reviewFrequency: { 
    type: String, 
    enum: ['Monthly', 'Quarterly', 'Annually', 'Biennially'], 
    default: 'Annually' 
  },
  
  // Status & Lifecycle
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Superseded', 'Under Review'], 
    default: 'Active' 
  },
  complianceLevel: { 
    type: String, 
    enum: ['Compliant', 'Non-Compliant', 'Partially Compliant', 'Under Assessment'], 
    default: 'Under Assessment' 
  },
  
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
  
  // Requirements & Controls
  requirements: [RequirementSchema],
  gaps: [GapSchema],
  auditFindings: [AuditFindingSchema],
  
  // Timeline
  lastAssessmentDate: { type: Date },
  nextAssessmentDate: { type: Date },
  lastAuditDate: { type: Date },
  nextAuditDate: { type: Date },
  
  // Documentation
  documents: [{ 
    title: String,
    url: String,
    type: { 
      type: String, 
      enum: ['Policy', 'Procedure', 'Evidence', 'Report', 'Other'] 
    },
    uploadedBy: { userId: String, userEmail: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Financial Impact
  complianceCost: {
    annual: { type: Number },
    oneTime: { type: Number },
    currency: { type: String, default: 'USD' },
  },
  
  // Risk Assessment
  riskLevel: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  riskScore: { type: Number, min: 1, max: 25 },
  
  // Integration
  linkedRisks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Risk' }],
  linkedControls: [{ type: String }], // IDs of related controls
  linkedPolicies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Policy' }],
  
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
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for compliance score calculation
ComplianceSchema.virtual('complianceScore').get(function() {
  if (!this.requirements || this.requirements.length === 0) return 0;
  
  const totalRequirements = this.requirements.length;
  const compliantRequirements = this.requirements.filter(req => req.status === 'Compliant').length;
  const partiallyCompliantRequirements = this.requirements.filter(req => req.status === 'Partially Compliant').length;
  
  return Math.round(((compliantRequirements + (partiallyCompliantRequirements * 0.5)) / totalRequirements) * 100);
});

// Virtual for gap count
ComplianceSchema.virtual('openGapsCount').get(function() {
  if (!this.gaps) return 0;
  return this.gaps.filter(gap => gap.status !== 'Closed').length;
});

// Virtual for critical findings count
ComplianceSchema.virtual('criticalFindingsCount').get(function() {
  if (!this.auditFindings) return 0;
  return this.auditFindings.filter(finding => 
    finding.severity === 'Critical' && finding.status !== 'Closed'
  ).length;
});

// Pre-save middleware to update compliance level based on score
ComplianceSchema.pre('save', function(next) {
  const score = this.complianceScore;
  if (score >= 90) {
    this.complianceLevel = 'Compliant';
  } else if (score >= 70) {
    this.complianceLevel = 'Partially Compliant';
  } else {
    this.complianceLevel = 'Non-Compliant';
  }
  next();
});

// Indexes for performance
ComplianceSchema.index({ type: 1, status: 1 });
ComplianceSchema.index({ category: 1, complianceLevel: 1 });
ComplianceSchema.index({ owner: 1 });
ComplianceSchema.index({ nextAssessmentDate: 1 });
ComplianceSchema.index({ nextAuditDate: 1 });
ComplianceSchema.index({ tags: 1 });
ComplianceSchema.index({ jurisdiction: 1, authority: 1 });

export default mongoose.models.Compliance || mongoose.model('Compliance', ComplianceSchema); 