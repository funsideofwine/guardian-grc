"use client";
import { useState, useEffect, useCallback } from "react";
import { Eye, Edit, Trash2, FileText, Upload } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Input from '@/components/ui/Input';

interface Document {
  _id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  status: string;
  version: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: {
    userId: string;
    userEmail: string;
  };
  uploadedAt: string;
  lastModified: string;
  tags: string[];
  accessLevel: string;
}

export default function DocumentRepositoryPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    status: '',
    search: ''
  });
  const [view, setView] = useState<'list' | 'grid'>('list');

  const fetchDocuments = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/documents?${params}`);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Published':
        return <FileText className="w-4 h-4 text-success" />;
      case 'Draft':
        return <FileText className="w-4 h-4 text-warning" />;
      case 'Under Review':
        return <FileText className="w-4 h-4 text-accent" />;
      case 'Archived':
        return <FileText className="w-4 h-4 text-muted" />;
      default:
        return <FileText className="w-4 h-4 text-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'badge bg-success';
      case 'Draft':
        return 'badge bg-warning text-danger';
      case 'Under Review':
        return 'badge bg-accent text-primary';
      case 'Archived':
        return 'badge bg-muted';
      default:
        return 'badge bg-muted';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Policy':
        return <FileText className="w-4 h-4 text-primary" />;
      case 'Procedure':
        return <FileText className="w-4 h-4 text-success" />;
      case 'Form':
        return <FileText className="w-4 h-4 text-accent" />;
      case 'Template':
        return <FileText className="w-4 h-4 text-warning" />;
      default:
        return <FileText className="w-4 h-4 text-muted" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          <h1 className="text-2xl font-bold text-primary">Document Management</h1>
          <p className="text-muted">Manage and organize organizational documents</p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Total Documents</p>
              <p className="text-2xl font-bold text-primary">{documents.length}</p>
            </div>
            <FileText className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Published</p>
              <p className="text-2xl font-bold text-success">
                {documents.filter(d => d.status === 'Published').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-success" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Drafts</p>
              <p className="text-2xl font-bold text-warning">
                {documents.filter(d => d.status === 'Draft').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-warning" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Under Review</p>
              <p className="text-2xl font-bold text-accent">
                {documents.filter(d => d.status === 'Under Review').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-accent" />
          </div>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search documents..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="select"
            >
              <option value="">All Types</option>
              <option value="Policy">Policy</option>
              <option value="Procedure">Procedure</option>
              <option value="Form">Form</option>
              <option value="Template">Template</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="select"
            >
              <option value="">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Under Review">Under Review</option>
              <option value="Archived">Archived</option>
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
              variant={view === 'grid' ? 'primary' : 'secondary'}
              onClick={() => setView('grid')}
            >
              Grid View
            </Button>
          </div>
        </div>
      </Card>

      {/* Documents Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document) => (
            <Card key={document._id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getTypeIcon(document.type)}
                  <span className="text-sm text-muted">{document.type}</span>
                </div>
                {getStatusIcon(document.status)}
              </div>
              
              <h3 className="text-lg font-semibold text-primary mb-2">{document.title}</h3>
              <p className="text-sm text-muted mb-4 line-clamp-2">{document.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Version:</span>
                  <span className="text-sm font-medium">{document.version}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Size:</span>
                  <span className="text-sm font-medium">{formatFileSize(document.fileSize)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Uploaded:</span>
                  <span className="text-sm font-medium">
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className={getStatusColor(document.status)}>
                    {document.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedDocument(document)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setSelectedDocument(document);
                        setShowUploadModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteDocument(document._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Documents List View */}
      {view === 'list' && (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Version</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document) => (
                  <tr key={document._id} className="hover:bg-background">
                    <td>
                      <div>
                        <div className="text-sm font-medium text-primary">
                          {document.title}
                        </div>
                        <div className="text-sm text-muted truncate max-w-xs">
                          {document.description}
                        </div>
                        <div className="text-xs text-muted">
                          by {document.uploadedBy.userEmail}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(document.type)}
                        <span className="text-sm text-muted">{document.type}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(document.status)}
                        <span className={getStatusColor(document.status)}>
                          {document.status}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm font-medium">{document.version}</span>
                    </td>
                    <td>
                      <span className="text-sm text-muted">{formatFileSize(document.fileSize)}</span>
                    </td>
                    <td>
                      <div className="text-sm text-muted">
                        {new Date(document.uploadedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => setSelectedDocument(document)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => {
                            setSelectedDocument(document);
                            setShowUploadModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteDocument(document._id)}
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <h2 className="text-xl font-bold text-primary mb-4">
              {selectedDocument ? 'Edit Document' : 'Upload Document'}
            </h2>
            <p className="text-muted mb-4">Document upload form will be implemented here.</p>
            <div className="flex gap-2">
              <Button onClick={() => {
                fetchDocuments();
                setShowUploadModal(false);
                setSelectedDocument(null);
              }}>
                Save
              </Button>
              <Button variant="secondary" onClick={() => {
                setShowUploadModal(false);
                setSelectedDocument(null);
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