import mongoose from '../lib/mongoose';

const IncidentUpdateSchema = new mongoose.Schema({
  update: { type: String, required: true },
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { 
    type: String, 
    enum: ['Status Change', 'Investigation', 'Resolution', 'Escalation', 'Communication'], 
    default: 'Status Change' 
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const IncidentActionSchema = new mongoose.Schema({
  action: { type: String, required: true },
  description: { type: String },
  assignedTo: {
    userId: { type: String },
    userEmail: { type: String },
  },
  dueDate: { type: Date },
  completedDate: { type: Date },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Completed', 'Overdue'], 
    default: 'Pending' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  notes: { type: String },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const IncidentEvidenceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['Document', 'Screenshot', 'Log File', 'Video', 'Audio', 'Physical', 'Other'], 
    required: true 
  },
  url: { type: String },
  uploadedBy: {
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
  },
  uploadedAt: { type: Date, default: Date.now },
  chainOfCustody: [{
    userId: { type: String },
    userEmail: { type: String },
    action: { type: String }, // e.g., 'Received', 'Transferred', 'Analyzed'
    timestamp: { type: Date, default: Date.now },
    notes: { type: String }
  }],
  tags: [{ type: String }]
}, { timestamps: true });

const IncidentSchema = new mongoose.Schema({
  // Basic Information
  incidentNumber: { type: String, unique: true, sparse: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  summary: { type: String },
  
  // Classification
  category: { 
    type: String, 
    enum: [
      'Security Incident', 'Data Breach', 'System Outage', 'Compliance Violation',
      'Physical Security', 'Human Error', 'Malware', 'Phishing', 'Unauthorized Access',
      'Data Loss', 'Network Attack', 'Application Failure', 'Infrastructure Issue',
      'Third Party Incident', 'Natural Disaster', 'Other'
    ],
    required: true 
  },
  subcategory: { type: String },
  severity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    required: true 
  },
  
  // Status & Lifecycle
  status: { 
    type: String, 
    enum: ['Open', 'Investigating', 'Contained', 'Resolved', 'Closed', 'Escalated'], 
    default: 'Open' 
  },
  stage: { 
    type: String, 
    enum: ['Detection', 'Analysis', 'Containment', 'Eradication', 'Recovery', 'Lessons Learned'], 
    default: 'Detection' 
  },
  
  // Timeline
  detectedAt: { type: Date, required: true },
  reportedAt: { type: Date, required: true },
  containedAt: { type: Date },
  resolvedAt: { type: Date },
  closedAt: { type: Date },
  slaTarget: { type: Date },
  slaBreached: { type: Boolean, default: false },
  
  // Impact Assessment
  impact: {
    business: { type: String },
    financial: { type: String },
    operational: { type: String },
    reputational: { type: String },
    regulatory: { type: String }
  },
  affectedSystems: [{ type: String }],
  affectedUsers: { type: Number },
  affectedData: { type: String },
  estimatedCost: { type: Number },
  actualCost: { type: Number },
  
  // Ownership & Responsibility
  reporter: {
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
  },
  owner: {
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
  },
  assignee: {
    userId: { type: String },
    userEmail: { type: String },
  },
  stakeholders: [{
    userId: { type: String },
    userEmail: { type: String },
    role: { type: String }, // e.g., 'Investigator', 'Communications', 'Legal', 'Management'
  }],
  
  // Investigation & Response
  updates: [IncidentUpdateSchema],
  actions: [IncidentActionSchema],
  evidence: [IncidentEvidenceSchema],
  
  // Root Cause Analysis
  rootCause: { type: String },
  contributingFactors: [{ type: String }],
  lessonsLearned: { type: String },
  
  // Communication
  internalCommunications: [{
    audience: { type: String }, // e.g., 'All Staff', 'Management', 'IT Team'
    message: { type: String },
    sentAt: { type: Date, default: Date.now },
    sentBy: { userId: String, userEmail: String }
  }],
  externalCommunications: [{
    audience: { type: String }, // e.g., 'Customers', 'Regulators', 'Media'
    message: { type: String },
    sentAt: { type: Date, default: Date.now },
    sentBy: { userId: String, userEmail: String },
    approvedBy: { userId: String, userEmail: String }
  }],
  
  // Regulatory & Legal
  regulatoryReporting: {
    required: { type: Boolean, default: false },
    reported: { type: Boolean, default: false },
    reportDate: { type: Date },
    authority: { type: String },
    reportNumber: { type: String },
    deadline: { type: Date }
  },
  legalInvolvement: {
    required: { type: Boolean, default: false },
    lawFirm: { type: String },
    caseNumber: { type: String },
    estimatedCost: { type: Number }
  },
  
  // Integration
  linkedIncidents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Incident' }],
  linkedRisks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Risk' }],
  linkedCompliance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Compliance' }],
  linkedPolicies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Policy' }],
  
  // Tags & Classification
  tags: [{ type: String }],
  confidentiality: { 
    type: String, 
    enum: ['Public', 'Internal', 'Confidential', 'Restricted'], 
    default: 'Internal' 
  },
  
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
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for incident duration
IncidentSchema.virtual('duration').get(function() {
  const endDate = this.resolvedAt || this.closedAt || new Date();
  return Math.floor((endDate.getTime() - this.detectedAt.getTime()) / (1000 * 60 * 60 * 24)); // Days
});

// Virtual for SLA status
IncidentSchema.virtual('slaStatus').get(function() {
  if (!this.slaTarget) return 'No SLA';
  const now = new Date();
  if (this.resolvedAt && this.resolvedAt <= this.slaTarget) return 'Met';
  if (now > this.slaTarget) return 'Breached';
  return 'In Progress';
});

// Virtual for open actions count
IncidentSchema.virtual('openActionsCount').get(function() {
  if (!this.actions) return 0;
  return this.actions.filter(action => action.status !== 'Completed').length;
});

// Virtual for critical actions count
IncidentSchema.virtual('criticalActionsCount').get(function() {
  if (!this.actions) return 0;
  return this.actions.filter(action => 
    action.priority === 'Critical' && action.status !== 'Completed'
  ).length;
});

// Pre-save middleware to generate incident number
IncidentSchema.pre('save', async function(next) {
  if (this.isNew && !this.incidentNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Incident').countDocuments({
      incidentNumber: new RegExp(`^INC-${year}-`)
    });
    this.incidentNumber = `INC-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Pre-save middleware to update SLA breached status
IncidentSchema.pre('save', function(next) {
  if (this.slaTarget && new Date() > this.slaTarget && this.status !== 'Resolved' && this.status !== 'Closed') {
    this.slaBreached = true;
  }
  next();
});

// Indexes for performance
IncidentSchema.index({ incidentNumber: 1 });
IncidentSchema.index({ status: 1, severity: 1 });
IncidentSchema.index({ category: 1, priority: 1 });
IncidentSchema.index({ owner: 1 });
IncidentSchema.index({ detectedAt: 1 });
IncidentSchema.index({ slaTarget: 1 });
IncidentSchema.index({ tags: 1 });

export default mongoose.models.Incident || mongoose.model('Incident', IncidentSchema); 