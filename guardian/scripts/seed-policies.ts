// @ts-nocheck
import mongoose from '../src/lib/mongoose';
import Policy from '../src/models/Policy';

const commonCategories = [
  'IT', 'HR', 'Security', 'Finance', 'Operations', 'Legal', 'Compliance', 'Risk', 'Procurement', 'Marketing', 'Other'
];

async function seedPolicies() {
  await mongoose.connect('mongodb://localhost:27017/guardian');
  const fakePolicies = Array.from({ length: 50 }).map((_, i) => ({
    name: `Demo Policy ${i + 1}`,
    description: `This is a simulated description for policy ${i + 1}.`,
    owner: { userId: `user${i + 1}`, userEmail: `user${i + 1}@example.com` },
    effectiveDate: new Date(Date.now() + Math.random() * 1e10).toISOString().slice(0, 10),
    reviewDate: new Date(Date.now() + Math.random() * 1e10).toISOString().slice(0, 10),
    version: `v${Math.floor(Math.random() * 5) + 1}.0`,
    category: commonCategories[Math.floor(Math.random() * commonCategories.length)],
    attachments: [],
    state: ['Draft', 'Review', 'Approved', 'Rejected'][Math.floor(Math.random() * 4)],
    comments: [],
    changeHistory: [],
  }));
  await Policy.insertMany(fakePolicies);
  console.log('Inserted 50 demo policies!');
  await mongoose.disconnect();
}

seedPolicies().catch(err => { console.error(err); process.exit(1); }); 