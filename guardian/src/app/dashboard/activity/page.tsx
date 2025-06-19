"use client";
import { useEffect, useState, useCallback } from "react";
import { useUser } from '@clerk/nextjs';
import { Download, Eye, Calendar, Activity, AlertTriangle, CheckCircle, XCircle, FileText, Shield, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';

function getUserRole(user: { id: string } | null | undefined) {
  if (!user) return 'Viewer';
  if (typeof window !== 'undefined') {
    let adminId = localStorage.getItem('adminUserId');
    if (!adminId) {
      localStorage.setItem('adminUserId', user.id);
      adminId = user.id;
    }
    if (user.id === adminId) return 'Admin';
  }
  return 'Viewer';
}

interface ActivityLog {
  _id: string;
  action: string;
  description: string;
  category: string;
  severity: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, unknown>;
}

export default function ActivityPage() {
  const { user } = useUser();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    severity: '',
    action: '',
    search: '',
    dateRange: '7d'
  });
  const role = getUserRole(user);

  const fetchActivities = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/audit-log?${params}`);
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (role === 'Admin') {
      fetchActivities();
    }
  }, [role, fetchActivities]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <XCircle className="w-4 h-4 text-danger" />;
      case 'High':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'Medium':
        return <AlertTriangle className="w-4 h-4 text-accent" />;
      case 'Low':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'Info':
        return <Activity className="w-4 h-4 text-primary" />;
      default:
        return <Activity className="w-4 h-4 text-muted" />;
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
      case 'Info':
        return 'badge bg-primary';
      default:
        return 'badge bg-muted';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Authentication':
        return <Shield className="w-4 h-4 text-primary" />;
      case 'Data Access':
        return <FileText className="w-4 h-4 text-success" />;
      case 'Configuration':
        return <Target className="w-4 h-4 text-accent" />;
      case 'System':
        return <Activity className="w-4 h-4 text-warning" />;
      default:
        return <Activity className="w-4 h-4 text-muted" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'text-success';
      case 'UPDATE':
        return 'text-warning';
      case 'DELETE':
        return 'text-danger';
      case 'LOGIN':
        return 'text-primary';
      case 'LOGOUT':
        return 'text-muted';
      default:
        return 'text-muted';
    }
  };

  if (role !== 'Admin') {
    return <div className="p-8 text-red-600 font-bold">Access denied. Only Admins can view the Activity Log.</div>;
  }

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
          <h1 className="text-2xl font-bold text-primary">Activity Log</h1>
          <p className="text-muted">Monitor system activities and user actions</p>
        </div>
        <Button
          onClick={() => {/* TODO: Export activity log */}}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Log
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Total Activities</p>
              <p className="text-2xl font-bold text-primary">{activities.length}</p>
            </div>
            <Activity className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Critical Events</p>
              <p className="text-2xl font-bold text-danger">
                {activities.filter(a => a.severity === 'Critical').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-danger" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">High Severity</p>
              <p className="text-2xl font-bold text-warning">
                {activities.filter(a => a.severity === 'High').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-warning" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Today&apos;s Activities</p>
              <p className="text-2xl font-bold text-accent">
                {activities.filter(a => {
                  const today = new Date();
                  const activityDate = new Date(a.timestamp);
                  return activityDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-accent" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <Input
            type="text"
            placeholder="Search activities..."
            value={filters.search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="select"
          >
            <option value="">All Categories</option>
            <option value="Authentication">Authentication</option>
            <option value="Data Access">Data Access</option>
            <option value="Configuration">Configuration</option>
            <option value="System">System</option>
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
            <option value="Info">Info</option>
          </select>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="select"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </Card>

      {/* Activity List */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Category</th>
                <th>Severity</th>
                <th>User</th>
                <th>Resource</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity._id} className="hover:bg-background">
                  <td>
                    <div>
                      <div className="text-sm font-medium text-primary">
                        <span className={getActionColor(activity.action)}>
                          {activity.action}
                        </span>
                      </div>
                      <div className="text-sm text-muted truncate max-w-xs">
                        {activity.description}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(activity.category)}
                      <span className="text-sm text-muted">{activity.category}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(activity.severity)}
                      <span className={getSeverityColor(activity.severity)}>
                        {activity.severity}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-muted">
                      {activity.userEmail}
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="text-sm font-medium text-primary">
                        {activity.resourceName}
                      </div>
                      <div className="text-xs text-muted">
                        {activity.resourceType}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-muted">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {/* TODO: View activity details */}}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-primary mb-4">Activity by Category</h3>
          <div className="space-y-3">
            {['Authentication', 'Data Access', 'Configuration', 'System'].map((category) => {
              const count = activities.filter(a => a.category === category).length;
              return (
                <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <span className="font-medium text-primary">{category}</span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-primary mb-4">Activity by Severity</h3>
          <div className="space-y-3">
            {['Critical', 'High', 'Medium', 'Low', 'Info'].map((severity) => {
              const count = activities.filter(a => a.severity === severity).length;
              return (
                <div key={severity} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(severity)}
                    <span className={`text-sm font-medium ${getSeverityColor(severity)}`}>
                      {count}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${getSeverityColor(severity)}`}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
} 