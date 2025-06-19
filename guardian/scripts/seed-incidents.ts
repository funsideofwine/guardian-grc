import mongoose from '../src/lib/mongoose';
import Incident from '../src/models/Incident';

const sampleIncidents = [
  {
    title: 'Suspicious Login Attempts Detected',
    description: 'Multiple failed login attempts detected from unknown IP addresses targeting admin accounts. Security monitoring system triggered alerts for potential brute force attack.',
    summary: 'Potential brute force attack on admin accounts',
    category: 'Security Incident',
    subcategory: 'Unauthorized Access',
    severity: 'High',
    priority: 'High',
    status: 'Investigating',
    stage: 'Analysis',
    detectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    slaTarget: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from detection
    impact: {
      business: 'Potential unauthorized access to sensitive systems',
      financial: 'Estimated $50,000 in investigation and remediation costs',
      operational: 'Increased security monitoring required',
      reputational: 'Low - incident contained internally',
      regulatory: 'May require reporting if data accessed'
    },
    affectedSystems: ['Admin Portal', 'User Management System'],
    affectedUsers: 0,
    affectedData: 'Admin account credentials',
    estimatedCost: 50000,
    actions: [
      {
        action: 'Block suspicious IP addresses',
        description: 'Add detected IP addresses to firewall blacklist',
        assignedTo: { userId: 'sample-user-id', userEmail: 'security@company.com' },
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: 'Completed',
        priority: 'Critical'
      },
      {
        action: 'Review admin account security',
        description: 'Audit all admin accounts for suspicious activity',
        assignedTo: { userId: 'sample-user-id', userEmail: 'it@company.com' },
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'In Progress',
        priority: 'High'
      },
      {
        action: 'Implement additional monitoring',
        description: 'Deploy enhanced login monitoring and alerting',
        assignedTo: { userId: 'sample-user-id', userEmail: 'security@company.com' },
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'Pending',
        priority: 'Medium'
      }
    ],
    updates: [
      {
        update: 'Incident reported and initial investigation started',
        userId: 'sample-user-id',
        userEmail: 'security@company.com',
        type: 'Status Change'
      },
      {
        update: 'Suspicious IP addresses identified and blocked',
        userId: 'sample-user-id',
        userEmail: 'security@company.com',
        type: 'Investigation'
      }
    ],
    evidence: [
      {
        title: 'Security Log Analysis',
        description: 'Analysis of failed login attempts and IP addresses',
        type: 'Log File',
        uploadedBy: { userId: 'sample-user-id', userEmail: 'security@company.com' }
      }
    ],
    rootCause: 'Weak password policies and lack of rate limiting on admin accounts',
    contributingFactors: ['No rate limiting on login attempts', 'Admin accounts not using MFA'],
    lessonsLearned: 'Implement rate limiting and mandatory MFA for all admin accounts',
    stakeholders: [
      { userId: 'sample-user-id', userEmail: 'security@company.com', role: 'Investigator' },
      { userId: 'sample-user-id', userEmail: 'it@company.com', role: 'System Administrator' }
    ],
    tags: ['security', 'brute-force', 'admin-access'],
    confidentiality: 'Internal'
  },
  {
    title: 'Database Performance Degradation',
    description: 'Customer database experiencing significant performance issues, causing slow response times and occasional timeouts for user queries.',
    summary: 'Database performance issues affecting customer experience',
    category: 'System Outage',
    subcategory: 'Application Failure',
    severity: 'Medium',
    priority: 'High',
    status: 'Contained',
    stage: 'Recovery',
    detectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    containedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    slaTarget: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    impact: {
      business: 'Customer experience degraded, potential revenue impact',
      financial: 'Estimated $25,000 in lost productivity and customer support',
      operational: 'Increased customer support calls and complaints',
      reputational: 'Customer frustration with slow service',
      regulatory: 'None'
    },
    affectedSystems: ['Customer Database', 'Web Application'],
    affectedUsers: 1500,
    affectedData: 'Customer query performance',
    estimatedCost: 25000,
    actualCost: 15000,
    actions: [
      {
        action: 'Database optimization',
        description: 'Optimize database queries and indexes',
        assignedTo: { userId: 'sample-user-id', userEmail: 'dba@company.com' },
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: 'In Progress',
        priority: 'High'
      },
      {
        action: 'Monitor performance metrics',
        description: 'Implement enhanced database monitoring',
        assignedTo: { userId: 'sample-user-id', userEmail: 'dba@company.com' },
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'Pending',
        priority: 'Medium'
      }
    ],
    updates: [
      {
        update: 'Performance issues detected and investigation started',
        userId: 'sample-user-id',
        userEmail: 'dba@company.com',
        type: 'Status Change'
      },
      {
        update: 'Root cause identified as inefficient queries',
        userId: 'sample-user-id',
        userEmail: 'dba@company.com',
        type: 'Investigation'
      },
      {
        update: 'Temporary fixes applied, performance improved',
        userId: 'sample-user-id',
        userEmail: 'dba@company.com',
        type: 'Resolution'
      }
    ],
    evidence: [
      {
        title: 'Database Performance Report',
        description: 'Analysis of slow queries and performance metrics',
        type: 'Document',
        uploadedBy: { userId: 'sample-user-id', userEmail: 'dba@company.com' }
      }
    ],
    rootCause: 'Inefficient database queries and missing indexes on frequently accessed tables',
    contributingFactors: ['Recent code deployment with unoptimized queries', 'Increased user load'],
    lessonsLearned: 'Implement query performance testing in CI/CD pipeline',
    stakeholders: [
      { userId: 'sample-user-id', userEmail: 'dba@company.com', role: 'Database Administrator' },
      { userId: 'sample-user-id', userEmail: 'dev@company.com', role: 'Developer' }
    ],
    tags: ['database', 'performance', 'customer-impact'],
    confidentiality: 'Internal'
  },
  {
    title: 'Phishing Email Campaign Detected',
    description: 'Employees reported receiving suspicious emails appearing to be from IT support requesting password resets. Security team confirmed this is a targeted phishing campaign.',
    summary: 'Targeted phishing campaign against employees',
    category: 'Phishing',
    subcategory: 'Social Engineering',
    severity: 'Medium',
    priority: 'Medium',
    status: 'Resolved',
    stage: 'Lessons Learned',
    detectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    containedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    slaTarget: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    impact: {
      business: 'Employee productivity affected by security concerns',
      financial: 'Minimal - no financial loss',
      operational: 'Increased security awareness training required',
      reputational: 'None - handled internally',
      regulatory: 'None'
    },
    affectedSystems: ['Email System'],
    affectedUsers: 50,
    affectedData: 'None - no data compromised',
    estimatedCost: 5000,
    actualCost: 3000,
    actions: [
      {
        action: 'Block phishing domains',
        description: 'Add phishing domains to email security filters',
        assignedTo: { userId: 'sample-user-id', userEmail: 'security@company.com' },
        dueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        status: 'Completed',
        priority: 'High'
      },
      {
        action: 'Security awareness training',
        description: 'Conduct additional phishing awareness training',
        assignedTo: { userId: 'sample-user-id', userEmail: 'hr@company.com' },
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'Completed',
        priority: 'Medium'
      }
    ],
    updates: [
      {
        update: 'Phishing campaign reported by multiple employees',
        userId: 'sample-user-id',
        userEmail: 'security@company.com',
        type: 'Status Change'
      },
      {
        update: 'Phishing domains identified and blocked',
        userId: 'sample-user-id',
        userEmail: 'security@company.com',
        type: 'Investigation'
      },
      {
        update: 'Incident resolved, no data compromised',
        userId: 'sample-user-id',
        userEmail: 'security@company.com',
        type: 'Resolution'
      }
    ],
    evidence: [
      {
        title: 'Phishing Email Samples',
        description: 'Examples of phishing emails received by employees',
        type: 'Document',
        uploadedBy: { userId: 'sample-user-id', userEmail: 'security@company.com' }
      }
    ],
    rootCause: 'Sophisticated phishing campaign targeting company employees',
    contributingFactors: ['Employees not recognizing phishing indicators', 'Email security filters not catching all variants'],
    lessonsLearned: 'Enhance email security filters and improve employee training',
    stakeholders: [
      { userId: 'sample-user-id', userEmail: 'security@company.com', role: 'Security Team' },
      { userId: 'sample-user-id', userEmail: 'hr@company.com', role: 'Training Coordinator' }
    ],
    tags: ['phishing', 'social-engineering', 'training'],
    confidentiality: 'Internal'
  },
  {
    title: 'Data Backup Failure',
    description: 'Automated backup system failed to complete scheduled database backup. Manual backup initiated but system needs investigation to prevent future failures.',
    summary: 'Automated backup system failure',
    category: 'Infrastructure Issue',
    subcategory: 'Backup Failure',
    severity: 'High',
    priority: 'High',
    status: 'Open',
    stage: 'Detection',
    detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    slaTarget: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from detection
    impact: {
      business: 'Risk of data loss if primary systems fail',
      financial: 'Potential significant cost if data recovery needed',
      operational: 'Manual backup processes required',
      reputational: 'None - internal issue',
      regulatory: 'May violate data retention requirements'
    },
    affectedSystems: ['Backup System', 'Database Servers'],
    affectedUsers: 0,
    affectedData: 'All company data at risk',
    estimatedCost: 100000,
    actions: [
      {
        action: 'Investigate backup system failure',
        description: 'Identify root cause of backup system failure',
        assignedTo: { userId: 'sample-user-id', userEmail: 'it@company.com' },
        dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000),
        status: 'In Progress',
        priority: 'Critical'
      },
      {
        action: 'Implement manual backup verification',
        description: 'Set up manual backup verification process',
        assignedTo: { userId: 'sample-user-id', userEmail: 'it@company.com' },
        dueDate: new Date(Date.now() + 8 * 60 * 60 * 1000),
        status: 'Pending',
        priority: 'High'
      }
    ],
    updates: [
      {
        update: 'Backup failure detected during routine monitoring',
        userId: 'sample-user-id',
        userEmail: 'it@company.com',
        type: 'Status Change'
      },
      {
        update: 'Manual backup initiated as temporary measure',
        userId: 'sample-user-id',
        userEmail: 'it@company.com',
        type: 'Investigation'
      }
    ],
    evidence: [
      {
        title: 'Backup System Logs',
        description: 'Error logs from backup system showing failure details',
        type: 'Log File',
        uploadedBy: { userId: 'sample-user-id', userEmail: 'it@company.com' }
      }
    ],
    rootCause: 'Under investigation',
    contributingFactors: ['Backup system maintenance overdue', 'Storage space issues'],
    lessonsLearned: 'TBD - investigation ongoing',
    stakeholders: [
      { userId: 'sample-user-id', userEmail: 'it@company.com', role: 'System Administrator' },
      { userId: 'sample-user-id', userEmail: 'dba@company.com', role: 'Database Administrator' }
    ],
    tags: ['backup', 'data-protection', 'infrastructure'],
    confidentiality: 'Internal'
  },
  {
    title: 'Compliance Violation - Unauthorized Data Access',
    description: 'Employee accessed customer data outside of authorized scope. Investigation revealed violation of data access policies and potential GDPR compliance issues.',
    summary: 'Unauthorized access to customer data by employee',
    category: 'Compliance Violation',
    subcategory: 'Data Access',
    severity: 'Critical',
    priority: 'Critical',
    status: 'Investigating',
    stage: 'Analysis',
    detectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    slaTarget: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    impact: {
      business: 'Potential regulatory fines and legal action',
      financial: 'Estimated $500,000 in potential fines and legal costs',
      operational: 'Enhanced access controls required',
      reputational: 'Significant damage if made public',
      regulatory: 'GDPR violation - potential reporting required'
    },
    affectedSystems: ['Customer Database', 'Access Control System'],
    affectedUsers: 150,
    affectedData: 'Customer personal information',
    estimatedCost: 500000,
    regulatoryReporting: {
      required: true,
      reported: false,
      authority: 'Data Protection Authority',
      deadline: new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours from detection
    },
    legalInvolvement: {
      required: true,
      lawFirm: 'Legal Counsel',
      estimatedCost: 100000
    },
    actions: [
      {
        action: 'Suspend employee access',
        description: 'Immediately suspend all system access for involved employee',
        assignedTo: { userId: 'sample-user-id', userEmail: 'hr@company.com' },
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'Completed',
        priority: 'Critical'
      },
      {
        action: 'Conduct forensic investigation',
        description: 'Detailed investigation of data access patterns and scope',
        assignedTo: { userId: 'sample-user-id', userEmail: 'security@company.com' },
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: 'In Progress',
        priority: 'Critical'
      },
      {
        action: 'Prepare regulatory notification',
        description: 'Prepare notification for data protection authority',
        assignedTo: { userId: 'sample-user-id', userEmail: 'legal@company.com' },
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: 'In Progress',
        priority: 'Critical'
      }
    ],
    updates: [
      {
        update: 'Unauthorized access detected through access monitoring',
        userId: 'sample-user-id',
        userEmail: 'security@company.com',
        type: 'Status Change'
      },
      {
        update: 'Employee suspended pending investigation',
        userId: 'sample-user-id',
        userEmail: 'hr@company.com',
        type: 'Investigation'
      }
    ],
    evidence: [
      {
        title: 'Access Log Analysis',
        description: 'Detailed analysis of employee access patterns',
        type: 'Log File',
        uploadedBy: { userId: 'sample-user-id', userEmail: 'security@company.com' }
      },
      {
        title: 'Policy Violation Report',
        description: 'Documentation of policy violations and scope',
        type: 'Document',
        uploadedBy: { userId: 'sample-user-id', userEmail: 'legal@company.com' }
      }
    ],
    rootCause: 'Under investigation',
    contributingFactors: ['Insufficient access controls', 'Lack of monitoring', 'Policy violations'],
    lessonsLearned: 'TBD - investigation ongoing',
    stakeholders: [
      { userId: 'sample-user-id', userEmail: 'legal@company.com', role: 'Legal Counsel' },
      { userId: 'sample-user-id', userEmail: 'security@company.com', role: 'Security Investigator' },
      { userId: 'sample-user-id', userEmail: 'hr@company.com', role: 'HR Manager' }
    ],
    tags: ['compliance', 'data-breach', 'gdpr', 'legal'],
    confidentiality: 'Confidential'
  }
];

async function seedIncidents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/guardian');
    console.log('Connected to MongoDB');

    // Clear existing incidents
    await Incident.deleteMany({});
    console.log('Cleared existing incidents');

    // Create sample incidents with owner information
    const incidentsWithOwners = sampleIncidents.map(incident => ({
      ...incident,
      reporter: {
        userId: 'sample-user-id',
        userEmail: 'admin@company.com'
      },
      owner: {
        userId: 'sample-user-id',
        userEmail: 'admin@company.com'
      }
    }));

    // Insert sample incidents
    const createdIncidents = await Incident.insertMany(incidentsWithOwners);
    console.log(`Created ${createdIncidents.length} sample incidents`);

    // Log created incidents
    createdIncidents.forEach(incident => {
      console.log(`- ${incident.incidentNumber}: ${incident.title} (${incident.category}, ${incident.severity})`);
    });

    console.log('Incident seeding completed successfully');
  } catch (error) {
    console.error('Error seeding incidents:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedIncidents(); 