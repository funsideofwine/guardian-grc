'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, Edit, Trash2, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Input from '@/components/ui/Input';

interface Incident {
  _id: string;
  incidentNumber: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  priority: string;
  reportedBy: {
    userId: string;
    userEmail: string;
  };
  assignedTo?: {
    userId: string;
    userEmail: string;
  };
  reportedAt: string;
  updatedAt: string;
  resolvedAt?: string;
  tags: string[];
  attachments: string[];
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    category: '',
    priority: '',
    search: ''
  });
  const [view, setView] = useState<'list' | 'kanban'>('list');

  const fetchIncidents = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/incidents?${params}`);
      const data = await response.json();
      setIncidents(data.incidents || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleDeleteIncident = async (incidentId: string) => {
    if (!confirm('Are you sure you want to delete this incident?')) return;

    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchIncidents();
      }
    } catch (error) {
      console.error('Error deleting incident:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-primary" />;
      case 'Resolved':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'Closed':
        return <CheckCircle className="w-4 h-4 text-muted" />;
      case 'Escalated':
        return <XCircle className="w-4 h-4 text-danger" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'badge bg-warning text-danger';
      case 'In Progress':
        return 'badge bg-accent text-primary';
      case 'Resolved':
        return 'badge bg-success';
      case 'Closed':
        return 'badge bg-muted';
      case 'Escalated':
        return 'badge bg-danger';
      default:
        return 'badge bg-muted';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'text-danger';
      case 'High':
        return 'text-warning';
      case 'Medium':
        return 'text-accent';
      case 'Low':
        return 'text-success';
      default:
        return 'text-muted';
    }
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
          <h1 className="text-2xl font-bold text-primary">Incident Management</h1>
          <p className="text-muted">Track and manage security incidents and issues</p>
        </div>
        <Button
          onClick={() => setShowIncidentForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Report Incident
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Total Incidents</p>
              <p className="text-2xl font-bold text-primary">{incidents.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Open</p>
              <p className="text-2xl font-bold text-warning">
                {incidents.filter(i => i.status === 'Open').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-warning" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">In Progress</p>
              <p className="text-2xl font-bold text-accent">
                {incidents.filter(i => i.status === 'In Progress').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-accent" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Resolved</p>
              <p className="text-2xl font-bold text-success">
                {incidents.filter(i => i.status === 'Resolved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search incidents..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="select"
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Escalated">Escalated</option>
            </select>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="select"
            >
              <option value="">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="select"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
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
              variant={view === 'kanban' ? 'primary' : 'secondary'}
              onClick={() => setView('kanban')}
            >
              Kanban View
            </Button>
          </div>
        </div>
      </Card>

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['Open', 'In Progress', 'Resolved', 'Closed'].map((status) => (
            <Card key={status}>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                {getStatusIcon(status)}
                {status}
                <span className="text-sm text-muted">
                  ({incidents.filter(i => i.status === status).length})
                </span>
              </h3>
              <div className="space-y-3">
                {incidents
                  .filter(incident => incident.status === status)
                  .map((incident) => (
                    <Card key={incident._id} className="p-3 hover:shadow-md transition-shadow">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-primary">
                            {incident.incidentNumber}
                          </h4>
                          <span className={getSeverityColor(incident.severity)}>
                            {incident.severity}
                          </span>
                        </div>
                        <p className="text-sm text-muted line-clamp-2">
                          {incident.title}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted">
                          <span>{new Date(incident.reportedAt).toLocaleDateString()}</span>
                          <span>{incident.reportedBy.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => setSelectedIncident(incident)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => {
                              setSelectedIncident(incident);
                              setShowIncidentForm(true);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Incidents List View */}
      {view === 'list' && (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <th>Incident</th>
                  <th>Status</th>
                  <th>Severity</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Reported</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident._id} className="hover:bg-background">
                    <td>
                      <div>
                        <div className="text-sm font-medium text-primary">
                          {incident.incidentNumber}
                        </div>
                        <div className="text-sm text-muted truncate max-w-xs">
                          {incident.title}
                        </div>
                        <div className="text-xs text-muted">
                          by {incident.reportedBy.userEmail}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(incident.status)}
                        <span className={getStatusColor(incident.status)}>
                          {incident.status}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`text-sm font-medium ${getPriorityColor(incident.priority)}`}>
                        {incident.priority}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm text-muted">
                        {incident.assignedTo?.userEmail || 'Unassigned'}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-muted">
                        {new Date(incident.reportedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => setSelectedIncident(incident)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => {
                            setSelectedIncident(incident);
                            setShowIncidentForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteIncident(incident._id)}
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

      {/* Incident Form Modal */}
      {showIncidentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <h2 className="text-xl font-bold text-primary mb-4">
              {selectedIncident ? 'Edit Incident' : 'Report Incident'}
            </h2>
            <p className="text-muted mb-4">Incident form component will be implemented here.</p>
            <div className="flex gap-2">
              <Button onClick={() => {
                fetchIncidents();
                setShowIncidentForm(false);
                setSelectedIncident(null);
              }}>
                Save
              </Button>
              <Button variant="secondary" onClick={() => {
                setShowIncidentForm(false);
                setSelectedIncident(null);
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