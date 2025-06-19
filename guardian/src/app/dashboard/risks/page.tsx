'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, Edit, Trash2, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import RiskForm from '@/components/risks/RiskForm';

interface Risk {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  owner: {
    userId: string;
    userEmail: string;
  };
  currentAssessment?: {
    likelihood: string;
    impact: string;
    score: number;
  };
  identifiedDate: string;
  nextReviewDate?: string;
  tags: string[];
}

// Temporary placeholder components
const RiskMatrix = ({ risks }: { risks: Risk[] }) => (
  <Card className="text-center py-8">
    <p className="text-muted">Risk Matrix visualization will be implemented here.</p>
    <p className="text-sm text-muted mt-2">Showing {risks.length} risks</p>
  </Card>
);

const RiskFilters = ({ filters, onFiltersChange }: { filters: Record<string, string>; onFiltersChange: (filters: Record<string, string>) => void }) => (
  <div className="flex gap-2">
    <Input
      type="text"
      placeholder="Search risks..."
      value={filters.search}
      onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
    />
    <select
      value={filters.status}
      onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
      className="select"
    >
      <option value="">All Status</option>
      <option value="Identified">Identified</option>
      <option value="Assessed">Assessed</option>
      <option value="Mitigated">Mitigated</option>
      <option value="Closed">Closed</option>
    </select>
    <select
      value={filters.category}
      onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
      className="select"
    >
      <option value="">All Categories</option>
      <option value="Strategic">Strategic</option>
      <option value="Operational">Operational</option>
      <option value="Financial">Financial</option>
      <option value="Compliance">Compliance</option>
      <option value="Technology">Technology</option>
    </select>
  </div>
);

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRiskForm, setShowRiskForm] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: ''
  });
  const [view, setView] = useState<'list' | 'matrix'>('list');

  const fetchRisks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/risks?${params}`);
      const data = await response.json();
      setRisks(data.risks || []);
    } catch (error) {
      console.error('Error fetching risks:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  const handleDeleteRisk = async (riskId: string) => {
    if (!confirm('Are you sure you want to delete this risk?')) return;

    try {
      const response = await fetch(`/api/risks/${riskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchRisks();
      }
    } catch (error) {
      console.error('Error deleting risk:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Identified':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'Assessed':
        return <Clock className="w-4 h-4 text-primary" />;
      case 'Mitigated':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'Closed':
        return <CheckCircle className="w-4 h-4 text-muted" />;
      case 'Escalated':
        return <XCircle className="w-4 h-4 text-danger" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-muted" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'badge bg-danger';
      case 'High':
        return 'badge bg-warning text-danger';
      case 'Medium':
        return 'badge bg-accent text-primary';
      case 'Low':
        return 'badge bg-success';
      default:
        return 'badge bg-muted';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score <= 4) return 'text-success';
    if (score <= 8) return 'text-warning';
    if (score <= 15) return 'text-accent';
    return 'text-danger';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Risk Management</h1>
          <p className="text-muted">Manage and monitor organizational risks</p>
        </div>
        <Button
          onClick={() => setShowRiskForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Risk
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Total Risks</p>
              <p className="text-2xl font-bold text-primary">{risks.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">High Priority</p>
              <p className="text-2xl font-bold text-danger">
                {risks.filter(r => r.priority === 'High' || r.priority === 'Critical').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-danger" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Open Risks</p>
              <p className="text-2xl font-bold text-warning">
                {risks.filter(r => r.status !== 'Closed').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-warning" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Mitigated</p>
              <p className="text-2xl font-bold text-success">
                {risks.filter(r => r.status === 'Mitigated').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <RiskFilters filters={filters} onFiltersChange={setFilters} />
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'list' ? 'primary' : 'secondary'}
              onClick={() => setView('list')}
            >
              List View
            </Button>
            <Button
              variant={view === 'matrix' ? 'primary' : 'secondary'}
              onClick={() => setView('matrix')}
            >
              Risk Matrix
            </Button>
          </div>
        </div>
      </Card>

      {/* Risk Matrix View */}
      {view === 'matrix' && (
        <RiskMatrix risks={risks} />
      )}

      {/* Risk List View */}
      {view === 'list' && (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <th>Risk</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Score</th>
                  <th>Owner</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((risk) => (
                  <tr key={risk._id} className="hover:bg-background">
                    <td>
                      <div>
                        <div className="text-sm font-medium text-primary">
                          {risk.title}
                        </div>
                        <div className="text-sm text-muted truncate max-w-xs">
                          {risk.description}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-muted">{risk.category}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(risk.status)}
                        <span className="text-sm text-muted">{risk.status}</span>
                      </div>
                    </td>
                    <td>
                      <span className={getPriorityColor(risk.priority)}>
                        {risk.priority}
                      </span>
                    </td>
                    <td>
                      {risk.currentAssessment?.score ? (
                        <span className={`text-sm font-medium ${getRiskScoreColor(risk.currentAssessment.score)}`}>
                          {risk.currentAssessment.score}
                        </span>
                      ) : (
                        <span className="text-sm text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <div className="text-sm text-muted">
                        {risk.owner.userEmail}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => setSelectedRisk(risk)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => {
                            setSelectedRisk(risk);
                            setShowRiskForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteRisk(risk._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      )}

      {/* Risk Form Modal */}
      {showRiskForm && (
        <RiskForm
          risk={selectedRisk}
          onClose={() => {
            setShowRiskForm(false);
            setSelectedRisk(null);
          }}
          onSave={() => {
            fetchRisks();
            setShowRiskForm(false);
            setSelectedRisk(null);
          }}
        />
      )}
    </div>
  );
} 