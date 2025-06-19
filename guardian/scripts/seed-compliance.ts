import mongoose from '../src/lib/mongoose';
import Compliance from '../src/models/Compliance';

const sampleCompliance = [
  {
    name: 'General Data Protection Regulation (GDPR)',
    description: 'EU regulation on data protection and privacy for all individuals within the European Union and the European Economic Area.',
    type: 'Regulation',
    category: 'Data Protection',
    jurisdiction: 'EU',
    authority: 'European Union',
    version: '2016/679',
    effectiveDate: new Date('2018-05-25'),
    reviewFrequency: 'Annually',
    status: 'Active',
    complianceLevel: 'Partially Compliant',
    riskLevel: 'High',
    riskScore: 18,
    complianceCost: {
      annual: 150000,
      oneTime: 500000,
      currency: 'USD'
    },
    requirements: [
      {
        title: 'Data Processing Lawfulness',
        description: 'Personal data must be processed lawfully, fairly, and transparently',
        reference: 'Article 5(1)(a)',
        category: 'Data Processing',
        priority: 'Critical',
        status: 'Compliant',
        evidence: [
          {
            description: 'Data processing policy document',
            url: '/documents/gdpr-processing-policy.pdf',
            uploadedBy: { userId: 'sample-user-id', userEmail: 'legal@company.com' },
            status: 'Approved'
          }
        ]
      },
      {
        title: 'Data Subject Rights',
        description: 'Individuals have the right to access, rectify, and erase their personal data',
        reference: 'Articles 12-22',
        category: 'Individual Rights',
        priority: 'High',
        status: 'Partially Compliant',
        evidence: [
          {
            description: 'Data subject rights procedure',
            url: '/documents/data-rights-procedure.pdf',
            uploadedBy: { userId: 'sample-user-id', userEmail: 'legal@company.com' },
            status: 'Pending'
          }
        ]
      },
      {
        title: 'Data Breach Notification',
        description: 'Data breaches must be reported within 72 hours',
        reference: 'Article 33',
        category: 'Incident Response',
        priority: 'Critical',
        status: 'Compliant',
        evidence: [
          {
            description: 'Data breach response plan',
            url: '/documents/breach-response-plan.pdf',
            uploadedBy: { userId: 'sample-user-id', userEmail: 'security@company.com' },
            status: 'Approved'
          }
        ]
      }
    ],
    gaps: [
      {
        title: 'Data Protection Impact Assessment',
        description: 'Missing DPIA for high-risk processing activities',
        severity: 'High',
        impact: 'Potential regulatory fines and reputational damage',
        remediationPlan: 'Conduct DPIA for all high-risk processing activities',
        assignedTo: { userId: 'sample-user-id', userEmail: 'dpo@company.com' },
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'In Progress',
        progress: 40,
        cost: 25000
      }
    ],
    auditFindings: [
      {
        title: 'Insufficient Data Retention Policies',
        description: 'Data retention periods not clearly defined for all data types',
        severity: 'Medium',
        category: 'Data Management',
        remediationPlan: 'Define and implement data retention policies',
        assignedTo: { userId: 'sample-user-id', userEmail: 'legal@company.com' },
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'Open',
        progress: 0
      }
    ],
    lastAssessmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    nextAssessmentDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
    lastAuditDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    nextAuditDate: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000),
    documents: [
      {
        title: 'GDPR Compliance Policy',
        url: '/documents/gdpr-policy.pdf',
        type: 'Policy',
        uploadedBy: { userId: 'sample-user-id', userEmail: 'legal@company.com' }
      },
      {
        title: 'Data Processing Register',
        url: '/documents/processing-register.xlsx',
        type: 'Report',
        uploadedBy: { userId: 'sample-user-id', userEmail: 'dpo@company.com' }
      }
    ],
    stakeholders: [
      { userId: 'sample-user-id', userEmail: 'dpo@company.com', role: 'Data Protection Officer' },
      { userId: 'sample-user-id', userEmail: 'legal@company.com', role: 'Legal Counsel' },
      { userId: 'sample-user-id', userEmail: 'it@company.com', role: 'IT Security' }
    ],
    tags: ['gdpr', 'data-protection', 'eu', 'privacy'],
    confidentiality: 'Internal'
  },
  {
    name: 'ISO 27001 Information Security Management',
    description: 'International standard for information security management systems (ISMS).',
    type: 'Standard',
    category: 'Information Security',
    jurisdiction: 'Global',
    authority: 'International Organization for Standardization',
    version: '2013',
    effectiveDate: new Date('2013-10-01'),
    reviewFrequency: 'Annually',
    status: 'Active',
    complianceLevel: 'Compliant',
    riskLevel: 'Medium',
    riskScore: 12,
    complianceCost: {
      annual: 75000,
      oneTime: 200000,
      currency: 'USD'
    },
    requirements: [
      {
        title: 'Information Security Policy',
        description: 'Establish and maintain information security policy',
        reference: 'A.5.1.1',
        category: 'Policy',
        priority: 'High',
        status: 'Compliant',
        evidence: [
          {
            description: 'Information Security Policy document',
            url: '/documents/iso27001-policy.pdf',
            uploadedBy: { userId: 'sample-user-id', userEmail: 'security@company.com' },
            status: 'Approved'
          }
        ]
      },
      {
        title: 'Access Control',
        description: 'Implement access control policies and procedures',
        reference: 'A.9.1',
        category: 'Access Management',
        priority: 'High',
        status: 'Compliant',
        evidence: [
          {
            description: 'Access control procedures',
            url: '/documents/access-control-procedures.pdf',
            uploadedBy: { userId: 'sample-user-id', userEmail: 'it@company.com' },
            status: 'Approved'
          }
        ]
      }
    ],
    gaps: [],
    auditFindings: [],
    lastAssessmentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    nextAssessmentDate: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000),
    lastAuditDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    nextAuditDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
    documents: [
      {
        title: 'ISMS Manual',
        url: '/documents/isms-manual.pdf',
        type: 'Policy',
        uploadedBy: { userId: 'sample-user-id', userEmail: 'security@company.com' }
      }
    ],
    stakeholders: [
      { userId: 'sample-user-id', userEmail: 'security@company.com', role: 'Information Security Manager' },
      { userId: 'sample-user-id', userEmail: 'it@company.com', role: 'IT Manager' }
    ],
    tags: ['iso27001', 'information-security', 'isms'],
    confidentiality: 'Internal'
  },
  {
    name: 'Sarbanes-Oxley Act (SOX)',
    description: 'US federal law that sets standards for all US public company boards, management, and public accounting firms.',
    type: 'Regulation',
    category: 'Financial',
    jurisdiction: 'US',
    authority: 'US Securities and Exchange Commission',
    version: '2002',
    effectiveDate: new Date('2002-07-30'),
    reviewFrequency: 'Quarterly',
    status: 'Active',
    complianceLevel: 'Under Assessment',
    riskLevel: 'High',
    riskScore: 20,
    complianceCost: {
      annual: 200000,
      oneTime: 750000,
      currency: 'USD'
    },
    requirements: [
      {
        title: 'Internal Controls Assessment',
        description: 'Management must assess and report on internal controls',
        reference: 'Section 404',
        category: 'Internal Controls',
        priority: 'Critical',
        status: 'Under Review',
        evidence: [
          {
            description: 'Internal controls framework',
            url: '/documents/sox-controls-framework.pdf',
            uploadedBy: { userId: 'sample-user-id', userEmail: 'finance@company.com' },
            status: 'Pending'
          }
        ]
      },
      {
        title: 'Financial Reporting',
        description: 'Accurate and reliable financial reporting',
        reference: 'Section 302',
        category: 'Financial Reporting',
        priority: 'Critical',
        status: 'Compliant',
        evidence: [
          {
            description: 'Financial reporting procedures',
            url: '/documents/financial-reporting-procedures.pdf',
            uploadedBy: { userId: 'sample-user-id', userEmail: 'finance@company.com' },
            status: 'Approved'
          }
        ]
      }
    ],
    gaps: [
      {
        title: 'IT General Controls',
        description: 'Insufficient IT general controls documentation',
        severity: 'High',
        impact: 'Potential material weaknesses in financial reporting',
        remediationPlan: 'Document and test IT general controls',
        assignedTo: { userId: 'sample-user-id', userEmail: 'it@company.com' },
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'In Progress',
        progress: 60,
        cost: 100000
      }
    ],
    auditFindings: [
      {
        title: 'Segregation of Duties',
        description: 'Inadequate segregation of duties in financial systems',
        severity: 'High',
        category: 'Access Control',
        remediationPlan: 'Implement proper segregation of duties controls',
        assignedTo: { userId: 'sample-user-id', userEmail: 'finance@company.com' },
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'Open',
        progress: 25
      }
    ],
    lastAssessmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    nextAssessmentDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
    lastAuditDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    nextAuditDate: new Date(Date.now() + 92 * 24 * 60 * 60 * 1000),
    documents: [
      {
        title: 'SOX Compliance Program',
        url: '/documents/sox-compliance-program.pdf',
        type: 'Policy',
        uploadedBy: { userId: 'sample-user-id', userEmail: 'finance@company.com' }
      }
    ],
    stakeholders: [
      { userId: 'sample-user-id', userEmail: 'finance@company.com', role: 'Chief Financial Officer' },
      { userId: 'sample-user-id', userEmail: 'audit@company.com', role: 'Internal Audit' },
      { userId: 'sample-user-id', userEmail: 'it@company.com', role: 'IT Controls' }
    ],
    tags: ['sox', 'financial', 'internal-controls', 'us'],
    confidentiality: 'Confidential'
  },
  {
    name: 'California Consumer Privacy Act (CCPA)',
    description: 'California state law that enhances privacy rights and consumer protection for residents of California.',
    type: 'Regulation',
    category: 'Data Protection',
    jurisdiction: 'California',
    authority: 'California Attorney General',
    version: '2018',
    effectiveDate: new Date('2020-01-01'),
    reviewFrequency: 'Annually',
    status: 'Active',
    complianceLevel: 'Non-Compliant',
    riskLevel: 'High',
    riskScore: 22,
    complianceCost: {
      annual: 100000,
      oneTime: 300000,
      currency: 'USD'
    },
    requirements: [
      {
        title: 'Consumer Rights Disclosure',
        description: 'Provide notice of consumer rights at or before data collection',
        reference: 'Section 1798.100',
        category: 'Consumer Rights',
        priority: 'Critical',
        status: 'Non-Compliant',
        evidence: []
      },
      {
        title: 'Data Subject Requests',
        description: 'Process consumer requests to know, delete, and opt-out',
        reference: 'Section 1798.120',
        category: 'Consumer Rights',
        priority: 'Critical',
        status: 'Non-Compliant',
        evidence: []
      }
    ],
    gaps: [
      {
        title: 'Privacy Notice Updates',
        description: 'Privacy policy does not include CCPA-mandated disclosures',
        severity: 'Critical',
        impact: 'Potential regulatory enforcement and fines',
        remediationPlan: 'Update privacy policy with CCPA disclosures',
        assignedTo: { userId: 'sample-user-id', userEmail: 'legal@company.com' },
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'Open',
        progress: 0,
        cost: 50000
      },
      {
        title: 'Data Subject Request Process',
        description: 'No process in place to handle CCPA data subject requests',
        severity: 'Critical',
        impact: 'Inability to comply with consumer rights',
        remediationPlan: 'Implement data subject request handling process',
        assignedTo: { userId: 'sample-user-id', userEmail: 'legal@company.com' },
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'Open',
        progress: 0,
        cost: 75000
      }
    ],
    auditFindings: [
      {
        title: 'Data Inventory Missing',
        description: 'No comprehensive data inventory for CCPA compliance',
        severity: 'High',
        category: 'Data Management',
        remediationPlan: 'Create comprehensive data inventory',
        assignedTo: { userId: 'sample-user-id', userEmail: 'dpo@company.com' },
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'Open',
        progress: 0
      }
    ],
    lastAssessmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    nextAssessmentDate: new Date(Date.now() + 360 * 24 * 60 * 60 * 1000),
    lastAuditDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    nextAuditDate: new Date(Date.now() + 355 * 24 * 60 * 60 * 1000),
    documents: [],
    stakeholders: [
      { userId: 'sample-user-id', userEmail: 'legal@company.com', role: 'Legal Counsel' },
      { userId: 'sample-user-id', userEmail: 'dpo@company.com', role: 'Data Protection Officer' }
    ],
    tags: ['ccpa', 'data-protection', 'california', 'privacy'],
    confidentiality: 'Internal'
  },
  {
    name: 'NIST Cybersecurity Framework',
    description: 'Voluntary framework for managing and reducing cybersecurity risk.',
    type: 'Framework',
    category: 'Cybersecurity',
    jurisdiction: 'US',
    authority: 'National Institute of Standards and Technology',
    version: '1.1',
    effectiveDate: new Date('2018-04-16'),
    reviewFrequency: 'Quarterly',
    status: 'Active',
    complianceLevel: 'Partially Compliant',
    riskLevel: 'Medium',
    riskScore: 15,
    complianceCost: {
      annual: 80000,
      oneTime: 150000,
      currency: 'USD'
    },
    requirements: [
      {
        title: 'Identify Function',
        description: 'Develop organizational understanding to manage cybersecurity risk',
        reference: 'ID',
        category: 'Risk Management',
        priority: 'High',
        status: 'Compliant',
        evidence: [
          {
            description: 'Asset inventory and risk assessment',
            url: '/documents/nist-identify-assessment.pdf',
            uploadedBy: { userId: 'sample-user-id', userEmail: 'security@company.com' },
            status: 'Approved'
          }
        ]
      },
      {
        title: 'Protect Function',
        description: 'Develop and implement appropriate safeguards',
        reference: 'PR',
        category: 'Security Controls',
        priority: 'High',
        status: 'Partially Compliant',
        evidence: [
          {
            description: 'Security controls implementation plan',
            url: '/documents/nist-protect-plan.pdf',
            uploadedBy: { userId: 'sample-user-id', userEmail: 'security@company.com' },
            status: 'Pending'
          }
        ]
      }
    ],
    gaps: [
      {
        title: 'Incident Response Plan',
        description: 'Incomplete incident response procedures',
        severity: 'Medium',
        impact: 'Delayed response to security incidents',
        remediationPlan: 'Complete incident response plan development',
        assignedTo: { userId: 'sample-user-id', userEmail: 'security@company.com' },
        dueDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
        status: 'In Progress',
        progress: 70,
        cost: 30000
      }
    ],
    auditFindings: [
      {
        title: 'Recovery Procedures',
        description: 'Business continuity and disaster recovery procedures need updating',
        severity: 'Medium',
        category: 'Business Continuity',
        remediationPlan: 'Update recovery procedures and test regularly',
        assignedTo: { userId: 'sample-user-id', userEmail: 'operations@company.com' },
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'Open',
        progress: 20
      }
    ],
    lastAssessmentDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    nextAssessmentDate: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
    lastAuditDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    nextAuditDate: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000),
    documents: [
      {
        title: 'NIST CSF Assessment Report',
        url: '/documents/nist-assessment-report.pdf',
        type: 'Report',
        uploadedBy: { userId: 'sample-user-id', userEmail: 'security@company.com' }
      }
    ],
    stakeholders: [
      { userId: 'sample-user-id', userEmail: 'security@company.com', role: 'Cybersecurity Manager' },
      { userId: 'sample-user-id', userEmail: 'it@company.com', role: 'IT Security' }
    ],
    tags: ['nist', 'cybersecurity', 'framework', 'us'],
    confidentiality: 'Internal'
  }
];

async function seedCompliance() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/guardian');
    console.log('Connected to MongoDB');

    // Clear existing compliance
    await Compliance.deleteMany({});
    console.log('Cleared existing compliance frameworks');

    // Create sample compliance with owner information
    const complianceWithOwners = sampleCompliance.map(comp => ({
      ...comp,
      owner: {
        userId: 'sample-user-id',
        userEmail: 'admin@company.com'
      }
    }));

    // Insert sample compliance
    const createdCompliance = await Compliance.insertMany(complianceWithOwners);
    console.log(`Created ${createdCompliance.length} sample compliance frameworks`);

    // Log created compliance
    createdCompliance.forEach(comp => {
      console.log(`- ${comp.name} (${comp.type}, ${comp.complianceLevel})`);
    });

    console.log('Compliance seeding completed successfully');
  } catch (error) {
    console.error('Error seeding compliance:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedCompliance(); 