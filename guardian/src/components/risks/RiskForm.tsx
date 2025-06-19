'use client';

import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface MitigationAction {
  description: string;
  assignedTo: string;
  dueDate?: string;
  cost?: number;
}

interface Stakeholder {
  userEmail: string;
  role: string;
}

interface Risk {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  status: string;
  priority: string;
  businessUnit?: string;
  project?: string;
  location?: string;
  tags: string[];
  confidentiality: string;
  targetResolutionDate?: string;
  nextReviewDate?: string;
  financialImpact?: {
    min?: number;
    max?: number;
    currency: string;
  };
  currentAssessment?: {
    likelihood: string;
    impact: string;
    rationale?: string;
    evidence?: string;
  };
  mitigationActions: MitigationAction[];
  stakeholders: Stakeholder[];
  regulatoryImpact: string[];
}

interface RiskFormProps {
  risk?: Risk;
  onClose: () => void;
  onSave: () => void;
}

const RISK_CATEGORIES = [
  'Strategic', 'Operational', 'Financial', 'Compliance', 'Technology', 
  'Cybersecurity', 'Legal', 'Reputational', 'Environmental', 'Health & Safety',
  'Supply Chain', 'Market', 'Credit', 'Liquidity', 'Other'
];

const LIKELIHOOD_LEVELS = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
const IMPACT_LEVELS = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
const STATUS_OPTIONS = ['Identified', 'Assessed', 'Mitigated', 'Monitored', 'Closed', 'Escalated'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

export default function RiskForm({ risk, onClose, onSave }: RiskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    status: 'Identified',
    priority: 'Medium',
    businessUnit: '',
    project: '',
    location: '',
    tags: [] as string[],
    confidentiality: 'Internal',
    targetResolutionDate: '',
    nextReviewDate: '',
    financialImpact: {
      min: '',
      max: '',
      currency: 'USD'
    },
    currentAssessment: {
      likelihood: 'Medium',
      impact: 'Medium',
      rationale: '',
      evidence: ''
    },
    mitigationActions: [] as MitigationAction[],
    stakeholders: [] as Stakeholder[],
    regulatoryImpact: [] as string[]
  });

  const [newTag, setNewTag] = useState('');
  const [newMitigationAction, setNewMitigationAction] = useState({
    description: '',
    assignedTo: '',
    dueDate: '',
    cost: ''
  });

  useEffect(() => {
    if (risk) {
      setFormData({
        title: risk.title || '',
        description: risk.description || '',
        category: risk.category || '',
        subcategory: risk.subcategory || '',
        status: risk.status || 'Identified',
        priority: risk.priority || 'Medium',
        businessUnit: risk.businessUnit || '',
        project: risk.project || '',
        location: risk.location || '',
        tags: risk.tags || [],
        confidentiality: risk.confidentiality || 'Internal',
        targetResolutionDate: risk.targetResolutionDate ? new Date(risk.targetResolutionDate).toISOString().split('T')[0] : '',
        nextReviewDate: risk.nextReviewDate ? new Date(risk.nextReviewDate).toISOString().split('T')[0] : '',
        financialImpact: {
          min: risk.financialImpact?.min?.toString() || '',
          max: risk.financialImpact?.max?.toString() || '',
          currency: risk.financialImpact?.currency || 'USD'
        },
        currentAssessment: {
          likelihood: risk.currentAssessment?.likelihood || 'Medium',
          impact: risk.currentAssessment?.impact || 'Medium',
          rationale: risk.currentAssessment?.rationale || '',
          evidence: risk.currentAssessment?.evidence || ''
        },
        mitigationActions: risk.mitigationActions || [],
        stakeholders: risk.stakeholders || [],
        regulatoryImpact: risk.regulatoryImpact || []
      });
    }
  }, [risk]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        financialImpact: {
          ...formData.financialImpact,
          min: formData.financialImpact.min ? parseFloat(formData.financialImpact.min) : undefined,
          max: formData.financialImpact.max ? parseFloat(formData.financialImpact.max) : undefined
        }
      };

      const url = risk ? `/api/risks/${risk._id}` : '/api/risks';
      const method = risk ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        onSave();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving risk:', error);
      alert('Error saving risk');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const addMitigationAction = () => {
    if (newMitigationAction.description.trim()) {
      setFormData({
        ...formData,
        mitigationActions: [...formData.mitigationActions, {
          ...newMitigationAction,
          cost: newMitigationAction.cost ? parseFloat(newMitigationAction.cost) : undefined,
          dueDate: newMitigationAction.dueDate || undefined
        }]
      });
      setNewMitigationAction({
        description: '',
        assignedTo: '',
        dueDate: '',
        cost: ''
      });
    }
  };

  const removeMitigationAction = (index: number) => {
    setFormData({
      ...formData,
      mitigationActions: formData.mitigationActions.filter((_, i) => i !== index)
    });
  };

  const calculateRiskScore = () => {
    const likelihoodScores = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5 };
    const impactScores = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5 };
    
    const likelihoodScore = likelihoodScores[formData.currentAssessment.likelihood as keyof typeof likelihoodScores] || 3;
    const impactScore = impactScores[formData.currentAssessment.impact as keyof typeof impactScores] || 3;
    
    return likelihoodScore * impactScore;
  };

  const getRiskLevel = (score: number) => {
    if (score <= 4) return 'Low';
    if (score <= 8) return 'Medium';
    if (score <= 15) return 'High';
    return 'Critical';
  };

  const getRiskScoreColor = (score: number) => {
    if (score <= 4) return 'text-success';
    if (score <= 8) return 'text-warning';
    if (score <= 15) return 'text-accent';
    return 'text-danger';
  };

  const riskScore = calculateRiskScore();
  const riskLevel = getRiskLevel(riskScore);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-primary">{risk ? 'Edit Risk' : 'Add New Risk'}</h2>
            <Button variant="secondary" onClick={onClose}>
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Risk Title *
              </label>
              <Input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="select"
              >
                <option value="">Select Category</option>
                {RISK_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="select"
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="select"
              >
                {PRIORITY_OPTIONS.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
            />
          </div>

          {/* Risk Assessment */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Risk Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Likelihood
                </label>
                <select
                  value={formData.currentAssessment.likelihood}
                  onChange={(e) => setFormData({
                    ...formData,
                    currentAssessment: { ...formData.currentAssessment, likelihood: e.target.value }
                  })}
                  className="select"
                >
                  {LIKELIHOOD_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Impact
                </label>
                <select
                  value={formData.currentAssessment.impact}
                  onChange={(e) => setFormData({
                    ...formData,
                    currentAssessment: { ...formData.currentAssessment, impact: e.target.value }
                  })}
                  className="select"
                >
                  {IMPACT_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Risk Score Display */}
            <div className="mt-4 p-4 bg-background rounded-md border border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-primary">Risk Score:</span>
                <span className={`text-lg font-bold ${getRiskScoreColor(riskScore)}`}>
                  {riskScore} ({riskLevel})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Assessment Rationale
                </label>
                <textarea
                  rows={3}
                  value={formData.currentAssessment.rationale}
                  onChange={(e) => setFormData({
                    ...formData,
                    currentAssessment: { ...formData.currentAssessment, rationale: e.target.value }
                  })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Supporting Evidence
                </label>
                <textarea
                  rows={3}
                  value={formData.currentAssessment.evidence}
                  onChange={(e) => setFormData({
                    ...formData,
                    currentAssessment: { ...formData.currentAssessment, evidence: e.target.value }
                  })}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Mitigation Actions */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Mitigation Actions</h3>
            
            {formData.mitigationActions.map((action, index) => (
              <Card key={index} className="p-4 mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-primary">Action {index + 1}</h4>
                  <Button
                    variant="danger"
                    onClick={() => removeMitigationAction(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted mb-2">{action.description}</p>
                <div className="text-xs text-muted">
                  Assigned to: {action.assignedTo} | Due: {action.dueDate} | Cost: ${action.cost}
                </div>
              </Card>
            ))}

            <Card className="p-4">
              <h4 className="font-medium text-primary mb-3">Add New Action</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Description</label>
                  <Input
                    type="text"
                    value={newMitigationAction.description}
                    onChange={(e) => setNewMitigationAction({ ...newMitigationAction, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Assigned To</label>
                  <Input
                    type="email"
                    value={newMitigationAction.assignedTo}
                    onChange={(e) => setNewMitigationAction({ ...newMitigationAction, assignedTo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Due Date</label>
                  <Input
                    type="date"
                    value={newMitigationAction.dueDate}
                    onChange={(e) => setNewMitigationAction({ ...newMitigationAction, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Estimated Cost</label>
                  <Input
                    type="number"
                    value={newMitigationAction.cost}
                    onChange={(e) => setNewMitigationAction({ ...newMitigationAction, cost: e.target.value })}
                  />
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={addMitigationAction}
                className="mt-3"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Action
              </Button>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Business Unit
                </label>
                <Input
                  type="text"
                  value={formData.businessUnit}
                  onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Project
                </label>
                <Input
                  type="text"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Target Resolution Date
                </label>
                <Input
                  type="date"
                  value={formData.targetResolutionDate}
                  onChange={(e) => setFormData({ ...formData, targetResolutionDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Next Review Date
                </label>
                <Input
                  type="date"
                  value={formData.nextReviewDate}
                  onChange={(e) => setFormData({ ...formData, nextReviewDate: e.target.value })}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-primary mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="flex-1"
                />
                <Button onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="badge bg-accent text-primary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-primary hover:text-danger"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-border pt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              {risk ? 'Update Risk' : 'Create Risk'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 