import mongoose from '../src/lib/mongoose';
import Risk from '../src/models/Risk';

const sampleRisks = [
  {
    title: 'Cybersecurity Data Breach',
    description: 'Risk of unauthorized access to sensitive customer data through cyber attacks, potentially leading to data breaches and regulatory penalties.',
    category: 'Cybersecurity',
    subcategory: 'Data Protection',
    status: 'Assessed',
    priority: 'Critical',
    businessUnit: 'IT Security',
    project: 'Data Protection Initiative',
    location: 'Global',
    tags: ['cybersecurity', 'data-breach', 'compliance'],
    confidentiality: 'Confidential',
    riskAppetite: 'Mitigate',
    targetResolutionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    financialImpact: {
      min: 100000,
      max: 5000000,
      currency: 'USD'
    },
    currentAssessment: {
      likelihood: 'High',
      impact: 'Very High',
      rationale: 'Recent increase in cyber attacks targeting similar organizations',
      evidence: 'Security audit findings, industry threat intelligence reports'
    },
    mitigationActions: [
      {
        description: 'Implement multi-factor authentication across all systems',
        assignedTo: 'security@company.com',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cost: 50000,
        status: 'In Progress',
        progress: 60
      },
      {
        description: 'Conduct security awareness training for all employees',
        assignedTo: 'hr@company.com',
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        cost: 25000,
        status: 'Not Started',
        progress: 0
      }
    ],
    stakeholders: [
      {
        userEmail: 'cto@company.com',
        role: 'Approver'
      },
      {
        userEmail: 'legal@company.com',
        role: 'Reviewer'
      }
    ],
    regulatoryImpact: ['GDPR', 'CCPA', 'SOX']
  },
  {
    title: 'Supply Chain Disruption',
    description: 'Risk of supply chain disruption due to geopolitical tensions, natural disasters, or supplier financial instability.',
    category: 'Supply Chain',
    subcategory: 'Vendor Management',
    status: 'Identified',
    priority: 'High',
    businessUnit: 'Operations',
    project: 'Supply Chain Resilience',
    location: 'Asia-Pacific',
    tags: ['supply-chain', 'vendor-risk', 'operations'],
    confidentiality: 'Internal',
    riskAppetite: 'Mitigate',
    targetResolutionDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    nextReviewDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    financialImpact: {
      min: 500000,
      max: 2000000,
      currency: 'USD'
    },
    currentAssessment: {
      likelihood: 'Medium',
      impact: 'High',
      rationale: 'Increasing geopolitical tensions in key supplier regions',
      evidence: 'Market analysis, supplier financial reports'
    },
    mitigationActions: [
      {
        description: 'Diversify supplier base across multiple regions',
        assignedTo: 'procurement@company.com',
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        cost: 100000,
        status: 'Not Started',
        progress: 0
      }
    ],
    stakeholders: [
      {
        userEmail: 'operations@company.com',
        role: 'Owner'
      }
    ],
    regulatoryImpact: []
  },
  {
    title: 'Regulatory Compliance Failure',
    description: 'Risk of failing to comply with new industry regulations, leading to fines, penalties, and reputational damage.',
    category: 'Compliance',
    subcategory: 'Regulatory',
    status: 'Monitored',
    priority: 'High',
    businessUnit: 'Legal & Compliance',
    project: 'Regulatory Compliance Program',
    location: 'Global',
    tags: ['compliance', 'regulatory', 'legal'],
    confidentiality: 'Internal',
    riskAppetite: 'Mitigate',
    targetResolutionDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    nextReviewDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    financialImpact: {
      min: 250000,
      max: 1000000,
      currency: 'USD'
    },
    currentAssessment: {
      likelihood: 'Medium',
      impact: 'High',
      rationale: 'New regulations being introduced in key markets',
      evidence: 'Regulatory updates, compliance gap analysis'
    },
    mitigationActions: [
      {
        description: 'Conduct comprehensive compliance audit',
        assignedTo: 'compliance@company.com',
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        cost: 75000,
        status: 'Completed',
        progress: 100
      },
      {
        description: 'Update internal policies and procedures',
        assignedTo: 'legal@company.com',
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        cost: 50000,
        status: 'In Progress',
        progress: 40
      }
    ],
    stakeholders: [
      {
        userEmail: 'legal@company.com',
        role: 'Owner'
      },
      {
        userEmail: 'compliance@company.com',
        role: 'Implementer'
      }
    ],
    regulatoryImpact: ['GDPR', 'SOX', 'Industry-specific regulations']
  },
  {
    title: 'Key Personnel Departure',
    description: 'Risk of losing critical personnel with specialized knowledge, potentially disrupting operations and projects.',
    category: 'Operational',
    subcategory: 'Human Resources',
    status: 'Identified',
    priority: 'Medium',
    businessUnit: 'Human Resources',
    project: 'Talent Retention',
    location: 'Global',
    tags: ['hr', 'talent', 'operational'],
    confidentiality: 'Internal',
    riskAppetite: 'Mitigate',
    targetResolutionDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
    nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    financialImpact: {
      min: 100000,
      max: 500000,
      currency: 'USD'
    },
    currentAssessment: {
      likelihood: 'Medium',
      impact: 'Medium',
      rationale: 'Competitive job market and increasing employee mobility',
      evidence: 'Employee satisfaction surveys, market compensation data'
    },
    mitigationActions: [
      {
        description: 'Develop succession planning for key roles',
        assignedTo: 'hr@company.com',
        dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        cost: 30000,
        status: 'Not Started',
        progress: 0
      },
      {
        description: 'Implement knowledge transfer programs',
        assignedTo: 'hr@company.com',
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        cost: 20000,
        status: 'Not Started',
        progress: 0
      }
    ],
    stakeholders: [
      {
        userEmail: 'hr@company.com',
        role: 'Owner'
      }
    ],
    regulatoryImpact: []
  },
  {
    title: 'Technology Infrastructure Failure',
    description: 'Risk of critical technology infrastructure failure leading to service outages and business disruption.',
    category: 'Technology',
    subcategory: 'Infrastructure',
    status: 'Mitigated',
    priority: 'High',
    businessUnit: 'IT',
    project: 'Infrastructure Resilience',
    location: 'Data Centers',
    tags: ['technology', 'infrastructure', 'availability'],
    confidentiality: 'Internal',
    riskAppetite: 'Mitigate',
    targetResolutionDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    financialImpact: {
      min: 200000,
      max: 1000000,
      currency: 'USD'
    },
    currentAssessment: {
      likelihood: 'Low',
      impact: 'High',
      rationale: 'Redundant systems and disaster recovery procedures in place',
      evidence: 'Infrastructure audit, disaster recovery testing results'
    },
    mitigationActions: [
      {
        description: 'Implement redundant backup systems',
        assignedTo: 'it@company.com',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cost: 150000,
        status: 'Completed',
        progress: 100
      },
      {
        description: 'Establish disaster recovery procedures',
        assignedTo: 'it@company.com',
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        cost: 50000,
        status: 'Completed',
        progress: 100
      }
    ],
    stakeholders: [
      {
        userEmail: 'it@company.com',
        role: 'Owner'
      }
    ],
    regulatoryImpact: []
  },
  {
    title: 'Market Competition Intensification',
    description: 'Risk of increased competition from new market entrants or existing competitors, potentially impacting market share and profitability.',
    category: 'Strategic',
    subcategory: 'Market',
    status: 'Assessed',
    priority: 'Medium',
    businessUnit: 'Strategy',
    project: 'Competitive Intelligence',
    location: 'Global',
    tags: ['strategic', 'competition', 'market'],
    confidentiality: 'Confidential',
    riskAppetite: 'Accept',
    targetResolutionDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
    nextReviewDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    financialImpact: {
      min: 500000,
      max: 3000000,
      currency: 'USD'
    },
    currentAssessment: {
      likelihood: 'High',
      impact: 'Medium',
      rationale: 'Market analysis shows increasing competitive activity',
      evidence: 'Market research, competitor analysis reports'
    },
    mitigationActions: [
      {
        description: 'Enhance product differentiation strategy',
        assignedTo: 'strategy@company.com',
        dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        cost: 100000,
        status: 'In Progress',
        progress: 30
      }
    ],
    stakeholders: [
      {
        userEmail: 'strategy@company.com',
        role: 'Owner'
      },
      {
        userEmail: 'marketing@company.com',
        role: 'Reviewer'
      }
    ],
    regulatoryImpact: []
  },
  {
    title: 'Environmental Compliance Violation',
    description: 'Risk of violating environmental regulations, leading to fines, legal action, and reputational damage.',
    category: 'Environmental',
    subcategory: 'Compliance',
    status: 'Identified',
    priority: 'Medium',
    businessUnit: 'Operations',
    project: 'Environmental Compliance',
    location: 'Manufacturing Sites',
    tags: ['environmental', 'compliance', 'regulatory'],
    confidentiality: 'Internal',
    riskAppetite: 'Mitigate',
    targetResolutionDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    financialImpact: {
      min: 100000,
      max: 750000,
      currency: 'USD'
    },
    currentAssessment: {
      likelihood: 'Low',
      impact: 'Medium',
      rationale: 'Strong environmental management systems in place',
      evidence: 'Environmental audit reports, compliance monitoring data'
    },
    mitigationActions: [
      {
        description: 'Conduct environmental compliance audit',
        assignedTo: 'environmental@company.com',
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        cost: 40000,
        status: 'Not Started',
        progress: 0
      }
    ],
    stakeholders: [
      {
        userEmail: 'environmental@company.com',
        role: 'Owner'
      }
    ],
    regulatoryImpact: ['Environmental Protection Agency regulations', 'Local environmental laws']
  },
  {
    title: 'Financial Market Volatility',
    description: 'Risk of adverse financial market conditions affecting investment returns, currency exchange rates, and funding availability.',
    category: 'Financial',
    subcategory: 'Market',
    status: 'Monitored',
    priority: 'Medium',
    businessUnit: 'Finance',
    project: 'Financial Risk Management',
    location: 'Global',
    tags: ['financial', 'market', 'volatility'],
    confidentiality: 'Internal',
    riskAppetite: 'Accept',
    targetResolutionDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    financialImpact: {
      min: 250000,
      max: 1500000,
      currency: 'USD'
    },
    currentAssessment: {
      likelihood: 'Medium',
      impact: 'Medium',
      rationale: 'Ongoing economic uncertainty and market volatility',
      evidence: 'Market analysis, economic indicators'
    },
    mitigationActions: [
      {
        description: 'Implement hedging strategies for currency exposure',
        assignedTo: 'treasury@company.com',
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        cost: 75000,
        status: 'In Progress',
        progress: 70
      }
    ],
    stakeholders: [
      {
        userEmail: 'treasury@company.com',
        role: 'Owner'
      },
      {
        userEmail: 'finance@company.com',
        role: 'Reviewer'
      }
    ],
    regulatoryImpact: []
  }
];

async function seedRisks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/guardian');
    console.log('Connected to MongoDB');

    // Clear existing risks
    await Risk.deleteMany({});
    console.log('Cleared existing risks');

    // Create sample risks with owner information
    const risksWithOwners = sampleRisks.map(risk => ({
      ...risk,
      owner: {
        userId: 'sample-user-id',
        userEmail: 'admin@company.com'
      }
    }));

    // Insert sample risks
    const createdRisks = await Risk.insertMany(risksWithOwners);
    console.log(`Created ${createdRisks.length} sample risks`);

    // Log created risks
    createdRisks.forEach(risk => {
      console.log(`- ${risk.title} (${risk.category}, ${risk.priority})`);
    });

    console.log('Risk seeding completed successfully');
  } catch (error) {
    console.error('Error seeding risks:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedRisks(); 