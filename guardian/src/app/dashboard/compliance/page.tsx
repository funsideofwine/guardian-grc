'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, Edit, Trash2, CheckCircle, XCircle, AlertTriangle, Clock, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';

interface Compliance {
  _id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  status: string;
  complianceLevel: string;
  authority: string;
  jurisdiction: string;
  owner: {
    userId: string;
    userEmail: string;
  };
  requirements: Record<string, unknown>[];
  gaps: Record<string, unknown>[];
  auditFindings: Record<string, unknown>[];
  lastAssessmentDate?: string;
  nextAssessmentDate?: string;
  tags: string[];
}

export default function CompliancePage() {
  const [compliance, setCompliance] = useState<Compliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComplianceForm, setShowComplianceForm] = useState(false);
  const [selectedCompliance, setSelectedCompliance] = useState<Compliance | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    type: '',
    complianceLevel: '',
    search: ''
  });
  const [view, setView] = useState<'list' | 'dashboard'>('list');

  const fetchCompliance = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/compliance?${params}`);
      const data = await response.json();
      setCompliance(data.compliance || []);
    } catch (error) {
      console.error('Error fetching compliance:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCompliance();
  }, [fetchCompliance]);

  const handleDeleteCompliance = async (complianceId: string) => {
    if (!confirm('Are you sure you want to delete this compliance framework?')) return;

    try {
      const response = await fetch(`/api/compliance/${complianceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchCompliance();
      }
    } catch (error) {
      console.error('Error deleting compliance:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'Inactive':
        return <XCircle className="w-4 h-4 text-muted" />;
      case 'Under Review':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'Superseded':
        return <AlertTriangle className="w-4 h-4 text-accent" />;
      default:
        return <FileText className="w-4 h-4 text-muted" />;
    }
  };

  const getComplianceLevelColor = (level: string) => {
    switch (level) {
      case 'Compliant':
        return 'badge bg-success';
      case 'Partially Compliant':
        return 'badge bg-warning text-danger';
      case 'Non-Compliant':
        return 'badge bg-danger';
      case 'Under Assessment':
        return 'badge bg-accent text-primary';
      default:
        return 'badge bg-muted';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Regulation':
        return <Shield className="w-4 h-4 text-primary" />;
      case 'Standard':
        return <FileText className="w-4 h-4 text-success" />;
      case 'Framework':
        return <CheckCircle className="w-4 h-4 text-accent" />;
      case 'Policy':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <FileText className="w-4 h-4 text-muted" />;
    }
  };

  const calculateComplianceScore = (compliance: Compliance) => {
    if (!compliance.requirements || compliance.requirements.length === 0) return 0;
    
    const totalRequirements = compliance.requirements.length;
    const compliantRequirements = compliance.requirements.filter(req => req.status === 'Compliant').length;
    const partiallyCompliantRequirements = compliance.requirements.filter(req => req.status === 'Partially Compliant').length;
    
    return Math.round(((compliantRequirements + (partiallyCompliantRequirements * 0.5)) / totalRequirements) * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
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
          <h1 className="text-2xl font-bold text-primary">Compliance Management</h1>
          <p className="text-muted">Track and manage regulatory compliance frameworks</p>
        </div>
        <Button
          onClick={() => setShowComplianceForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Framework
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Total Frameworks</p>
              <p className="text-2xl font-bold text-primary">{compliance.length}</p>
            </div>
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Compliant</p>
              <p className="text-2xl font-bold text-success">
                {compliance.filter(c => c.complianceLevel === 'Compliant').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Open Gaps</p>
              <p className="text-2xl font-bold text-warning">
                {compliance.reduce((total, c) => total + (c.gaps?.filter(g => g.status !== 'Closed').length || 0), 0)}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-warning" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Critical Findings</p>
              <p className="text-2xl font-bold text-danger">
                {compliance.reduce((total, c) => total + (c.auditFindings?.filter(f => f.severity === 'Critical' && f.status !== 'Closed').length || 0), 0)}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-danger" />
          </div>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search frameworks..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="select"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Under Review">Under Review</option>
              <option value="Superseded">Superseded</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="select"
            >
              <option value="">All Categories</option>
              <option value="Data Protection">Data Protection</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Financial">Financial</option>
              <option value="Environmental">Environmental</option>
              <option value="Information Security">Information Security</option>
            </select>
            <select
              value={filters.complianceLevel}
              onChange={(e) => setFilters({ ...filters, complianceLevel: e.target.value })}
              className="select"
            >
              <option value="">All Levels</option>
              <option value="Compliant">Compliant</option>
              <option value="Partially Compliant">Partially Compliant</option>
              <option value="Non-Compliant">Non-Compliant</option>
              <option value="Under Assessment">Under Assessment</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'list' ? 'primary' : 'secondary'}
              onClick={() => setView('list')}
            >
              List View
            </Button>
            <Button
              variant={view === 'dashboard' ? 'primary' : 'secondary'}
              onClick={() => setView('dashboard')}
            >
              Dashboard
            </Button>
          </div>
        </div>
      </Card>

      {/* Compliance Dashboard View */}
      {view === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {compliance.map((framework) => (
            <Card key={framework._id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getTypeIcon(framework.type)}
                  <span className="text-sm text-muted">{framework.type}</span>
                </div>
                {getStatusIcon(framework.status)}
              </div>
              
              <h3 className="text-lg font-semibold text-primary mb-2">{framework.name}</h3>
              <p className="text-sm text-muted mb-4 line-clamp-2">{framework.description}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Compliance Score:</span>
                  <span className={`text-sm font-medium ${getScoreColor(calculateComplianceScore(framework))}`}>
                    {calculateComplianceScore(framework)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Requirements:</span>
                  <span className="text-sm font-medium">{framework.requirements?.length || 0}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Open Gaps:</span>
                  <span className="text-sm font-medium text-warning">
                    {framework.gaps?.filter(g => g.status !== 'Closed').length || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Critical Findings:</span>
                  <span className="text-sm font-medium text-danger">
                    {framework.auditFindings?.filter(f => f.severity === 'Critical' && f.status !== 'Closed').length || 0}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className={getComplianceLevelColor(framework.complianceLevel)}>
                    {framework.complianceLevel}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedCompliance(framework)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setSelectedCompliance(framework);
                        setShowComplianceForm(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Compliance List View */}
      {view === 'list' && (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <th>Framework</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Compliance Level</th>
                  <th>Score</th>
                  <th>Owner</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {compliance.map((framework) => (
                  <tr key={framework._id} className="hover:bg-background">
                    <td>
                      <div>
                        <div className="text-sm font-medium text-primary">
                          {framework.name}
                        </div>
                        <div className="text-sm text-muted truncate max-w-xs">
                          {framework.description}
                        </div>
                        {framework.authority && (
                          <div className="text-xs text-muted">
                            {framework.authority} {framework.jurisdiction && `(${framework.jurisdiction})`}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(framework.type)}
                        <span className="text-sm text-muted">{framework.type}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(framework.status)}
                        <span className="text-sm text-muted">{framework.status}</span>
                      </div>
                    </td>
                    <td>
                      <span className={getComplianceLevelColor(framework.complianceLevel)}>
                        {framework.complianceLevel}
                      </span>
                    </td>
                    <td>
                      <span className={`text-sm font-medium ${getScoreColor(calculateComplianceScore(framework))}`}>
                        {calculateComplianceScore(framework)}%
                      </span>
                    </td>
                    <td>
                      <div className="text-sm text-muted">
                        {framework.owner.userEmail}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => setSelectedCompliance(framework)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => {
                            setSelectedCompliance(framework);
                            setShowComplianceForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteCompliance(framework._id)}
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

      {/* Compliance Form Modal */}
      {showComplianceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <h2 className="text-xl font-bold text-primary mb-4">
              {selectedCompliance ? 'Edit Compliance Framework' : 'Add Compliance Framework'}
            </h2>
            <p className="text-muted mb-4">Compliance form component will be implemented here.</p>
            <div className="flex gap-2">
              <Button onClick={() => {
                fetchCompliance();
                setShowComplianceForm(false);
                setSelectedCompliance(null);
              }}>
                Save
              </Button>
              <Button variant="secondary" onClick={() => {
                setShowComplianceForm(false);
                setSelectedCompliance(null);
              }}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 