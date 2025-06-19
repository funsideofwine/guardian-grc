"use client";
import { useEffect, useState, useRef, Fragment, useCallback } from "react";
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { useUser } from '@clerk/nextjs';
import { Dialog } from '@headlessui/react';

const states = ["Draft", "Review", "Approved", "Rejected"] as const;
type PolicyState = typeof states[number];

interface Comment {
  _id: string;
  text: string;
  userId: string;
  createdAt: string;
}

interface Policy {
  _id: string;
  name: string;
  description?: string;
  owner?: { userId: string; userEmail: string };
  effectiveDate?: string;
  reviewDate?: string;
  version?: string;
  category?: string;
  attachments?: { url: string, name: string }[];
  state: PolicyState;
  comments: Comment[];
}

function getUserRole(user: unknown) {
  if (!user || typeof user !== 'object' || user === null) return 'Viewer';
  const userObj = user as { id: string; primaryEmailAddress?: { emailAddress?: string } };
  if (typeof window !== 'undefined') {
    let adminId = localStorage.getItem('adminUserId');
    if (!adminId) {
      localStorage.setItem('adminUserId', userObj.id);
      adminId = userObj.id;
    }
    if (userObj.id === adminId) return 'Admin';
  }
  const email = userObj.primaryEmailAddress?.emailAddress || '';
  if (email.includes('manager')) return 'Manager';
  return 'Viewer';
}

// Helper to normalize attachments
function normalizeAttachments(attachments: unknown): { url: string, name: string }[] {
  if (!attachments) return [];
  if (Array.isArray(attachments) && attachments.length > 0) {
    if (typeof attachments[0] === 'object' && attachments[0] !== null && 'url' in attachments[0] && 'name' in attachments[0]) {
      return attachments as { url: string, name: string }[];
    } else if (attachments.every((a: unknown) => typeof a === 'string')) {
      return (attachments as string[]).map(s => ({ url: s, name: s }));
    }
  }
  return [];
}

const commonCategories = [
  'IT', 'HR', 'Security', 'Finance', 'Operations', 'Legal', 'Compliance', 'Risk', 'Procurement', 'Marketing', 'Other'
];

export default function PoliciesPage() {
  const { user } = useUser();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newEffectiveDate, setNewEffectiveDate] = useState("");
  const [newReviewDate, setNewReviewDate] = useState("");
  const [newVersion, setNewVersion] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [notif, setNotif] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const role = getUserRole(user);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [commentModal, setCommentModal] = useState<{ open: boolean, policyId: string | null }>({ open: false, policyId: null });
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalPolicy, setModalPolicy] = useState<Policy | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [deleteModal, setDeleteModal] = useState<{ open: boolean, policy: Policy | null }>({ open: false, policy: null });
  const [editModal, setEditModal] = useState<{ open: boolean, policy: Policy | null }>({ open: false, policy: null });
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    effectiveDate: '',
    reviewDate: '',
    version: '',
    category: '',
  });
  const [addAttachments, setAddAttachments] = useState<{ url: string, name: string }[]>([]);
  const [editAttachments, setEditAttachments] = useState<{ url: string, name: string }[]>([]);
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const [attachmentModal, setAttachmentModal] = useState<{ open: boolean, policy: Policy | null }>({ open: false, policy: null });
  const attachmentFileInputRef = useRef<HTMLInputElement>(null);

  const fetchPolicies = useCallback(async () => {
    const res = await fetch('/api/policies', {
      headers: user ? {
        'x-user-id': user.id,
        'x-user-email': user.primaryEmailAddress?.emailAddress || '',
      } : {},
    });
    const data = await res.json();
    setPolicies(data.policies || []);
  }, [user]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const addPolicy = async () => {
    if (!newName.trim() || !newDescription.trim() || !newEffectiveDate || !newReviewDate || !newVersion.trim() || !newCategory.trim()) {
      setNotif('Please fill in all required fields.');
      return;
    }
    await fetch('/api/policies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(user ? {
          'x-user-id': user.id,
          'x-user-email': user.primaryEmailAddress?.emailAddress || '',
        } : {}),
      },
      body: JSON.stringify({
        name: newName,
        description: newDescription,
        owner: user ? { userId: user.id, userEmail: user.primaryEmailAddress?.emailAddress || '' } : undefined,
        effectiveDate: newEffectiveDate,
        reviewDate: newReviewDate,
        version: newVersion,
        category: newCategory,
        attachments: normalizeAttachments(addAttachments),
      }),
    });
    setNewName("");
    setNewDescription("");
    setNewEffectiveDate("");
    setNewReviewDate("");
    setNewVersion("");
    setNewCategory("");
    setAddAttachments([]);
    setModalOpen(false);
    setNotif(`Policy '${newName}' created as Draft.`);
    setTimeout(() => setNotif(null), 3000);
    fetchPolicies();
  };

  const fetchPolicyById = async (id: string) => {
    const res = await fetch(`/api/policies`);
    const data = await res.json();
    const found = data.policies.find((p: Policy) => p._id === id);
    setModalPolicy(found);
  };

  const addComment = async () => {
    if (!newComment.trim() || !modalPolicy) return;
    await fetch('/api/policies', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(user ? {
          'x-user-id': user.id,
          'x-user-email': user.primaryEmailAddress?.emailAddress || '',
        } : {}),
      },
      body: JSON.stringify({
        id: modalPolicy._id,
        comment: {
          text: newComment,
          userId: user?.id || '',
          userEmail: user?.primaryEmailAddress?.emailAddress || '',
        },
      }),
    });
    setNewComment("");
    setEditingCommentId(null);
    setEditingText("");
    await fetchPolicyById(modalPolicy._id);
    fetchPolicies();
  };

  const saveEditComment = async (commentId: string) => {
    if (!editingText.trim() || !modalPolicy) return;
    await fetch('/api/policies', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(user ? {
          'x-user-id': user.id,
          'x-user-email': user.primaryEmailAddress?.emailAddress || '',
        } : {}),
      },
      body: JSON.stringify({
        id: modalPolicy._id,
        commentId,
        commentText: editingText,
      }),
    });
    setEditingCommentId(null);
    setEditingText("");
    await fetchPolicyById(modalPolicy._id);
    fetchPolicies();
  };

  const deleteComment = async (commentId: string) => {
    if (!modalPolicy) return;
    await fetch('/api/policies', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(user ? {
          'x-user-id': user.id,
          'x-user-email': user.primaryEmailAddress?.emailAddress || '',
        } : {}),
      },
      body: JSON.stringify({
        id: modalPolicy._id,
        commentId,
        delete: true,
      }),
    });
    setEditingCommentId(null);
    setEditingText("");
    await fetchPolicyById(modalPolicy._id);
    fetchPolicies();
  };

  // Multi-string filter
  const filteredPolicies = policies.filter(policy => {
    const terms = search.toLowerCase().split(' ').filter(Boolean);
    return terms.every(term =>
      policy.name?.toLowerCase().includes(term) ||
      policy.description?.toLowerCase().includes(term) ||
      policy.owner?.userEmail?.toLowerCase().includes(term) ||
      (policy.effectiveDate ? new Date(policy.effectiveDate).toLocaleDateString().toLowerCase() : '').includes(term) ||
      (policy.reviewDate ? new Date(policy.reviewDate).toLocaleDateString().toLowerCase() : '').includes(term) ||
      policy.version?.toLowerCase().includes(term) ||
      policy.category?.toLowerCase().includes(term) ||
      policy.state?.toLowerCase().includes(term)
    ) && (filter === "all" || policy.state === filter);
  });

  const paginatedPolicies = filteredPolicies.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(filteredPolicies.length / rowsPerPage);

  // Open edit modal and prefill form
  const openEditModal = (policy: Policy) => {
    setEditForm({
      name: policy.name || '',
      description: policy.description || '',
      effectiveDate: policy.effectiveDate ? policy.effectiveDate.slice(0, 10) : '',
      reviewDate: policy.reviewDate ? policy.reviewDate.slice(0, 10) : '',
      version: policy.version || '',
      category: policy.category || '',
    });
    setEditModal({ open: true, policy });
    setEditAttachments([]);
  };

  // Handle edit form change
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };

  // Handle edit category change
  const handleEditCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditForm(f => ({ ...f, category: e.target.value }));
  };

  // Save edit
  const saveEditPolicy = async () => {
    if (!editModal.policy) return;
    await fetch('/api/policies', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(user ? {
          'x-user-id': user.id,
          'x-user-email': user.primaryEmailAddress?.emailAddress || '',
        } : {}),
      },
      body: JSON.stringify({
        id: editModal.policy._id,
        name: editForm.name,
        description: editForm.description,
        effectiveDate: editForm.effectiveDate,
        reviewDate: editForm.reviewDate,
        version: editForm.version,
        category: editForm.category,
        attachments: normalizeAttachments(editAttachments),
      }),
    });
    setEditModal({ open: false, policy: null });
    fetchPolicies();
  };

  // Handler to open the modal
  const openAttachmentModal = (policy: Policy) => {
    setAttachmentModal({ open: true, policy: { ...policy, attachments: normalizeAttachments(policy.attachments) } });
  };

  // Handler to add files
  const handleAttachmentModalAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (attachmentModal.policy && files.length > 0) {
      // Upload files to backend
      const formData = new FormData();
      files.forEach(file => formData.append('file', file));
      const uploadRes = await fetch('/api/policies/attachments', {
        method: 'POST',
        body: formData,
      });
      if (uploadRes.ok) {
        const { files: uploadedFiles } = await uploadRes.json();
        const currentAttachments = normalizeAttachments(attachmentModal.policy.attachments);
        const newAttachments = [
          ...currentAttachments,
          ...uploadedFiles
        ];
        // Optimistically update modal state
        setAttachmentModal(m => m.policy ? { ...m, policy: { ...m.policy, attachments: newAttachments } } : m);
        updatePolicyAttachments(attachmentModal.policy._id, newAttachments);
      }
    }
    e.target.value = '';
  };

  // Handler to delete an attachment
  const handleAttachmentModalDelete = (idx: number) => {
    if (!attachmentModal.policy) return;
    const currentAttachments = normalizeAttachments(attachmentModal.policy.attachments);
    const newAttachments = [...currentAttachments];
    newAttachments.splice(idx, 1);
    // Optimistically update modal state
    setAttachmentModal(m => m.policy ? { ...m, policy: { ...m.policy, attachments: newAttachments } } : m);
    updatePolicyAttachments(attachmentModal.policy._id, newAttachments);
  };

  // Backend update helper
  const updatePolicyAttachments = async (policyId: string, attachments: { url: string, name: string }[]) => {
    // Optimistically update modal state
    setAttachmentModal(m => (
      m.policy && m.policy._id === policyId
        ? { ...m, policy: { ...m.policy, attachments } }
        : m
    ));
    await fetch('/api/policies', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(user ? {
          'x-user-id': user.id,
          'x-user-email': user.primaryEmailAddress?.emailAddress || '',
        } : {}),
      },
      body: JSON.stringify({ id: policyId, attachments }),
    });
    fetchPolicies();
    // Fetch the updated policy and update the modal state for consistency
    const res = await fetch(`/api/policies`);
    const data = await res.json();
    const found = data.policies.find((p: Policy) => p._id === policyId);
    setAttachmentModal(m => ({ ...m, policy: found ? { ...found, attachments: normalizeAttachments(found.attachments) } : m.policy }));
    // Also update editModal if open for this policy
    setEditModal(m => (m.open && m.policy && m.policy._id === policyId)
      ? { ...m, policy: { ...m.policy, attachments: normalizeAttachments(found.attachments) } }
      : m
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Policies</h1>
      {notif && (
        <div className="mb-4 p-2 bg-primary text-white rounded">{notif}</div>
      )}
      {role === 'Admin' || role === 'Manager' ? (
        <div className="mb-6">
          <Button type="button" onClick={() => setModalOpen(true)}>
            Add Policy
          </Button>
          <Dialog open={modalOpen} onClose={() => setModalOpen(false)} as={Fragment}>
            <div className="modal">
              <div className="modal-content">
                <Dialog.Title className="text-xl font-bold mb-4">Add New Policy</Dialog.Title>
                <form onSubmit={e => { e.preventDefault(); addPolicy(); }} className="flex flex-col gap-3">
                  <Input name="name" placeholder="Policy Name" required />
                  <Input name="description" placeholder="Description" required />
                  <Input name="effectiveDate" type="date" placeholder="Effective Date" required />
                  <Input name="reviewDate" type="date" placeholder="Review Date" required />
                  <Input name="version" placeholder="Version" required />
                  <select name="category" className="select" required>
                    <option value="">Select category...</option>
                    {commonCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="flex gap-4 items-end">
                    <div className="flex flex-col flex-1">
                      <label className="block mb-1 font-medium">Attachments</label>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => addFileInputRef.current?.click()} title="Upload attachments" className="p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0v9A2.25 2.25 0 0113.5 20.25h-3A2.25 2.25 0 018.25 18V9m7.5 0H8.25" /></svg>
                        </button>
                        <input
                          type="file"
                          multiple
                          ref={addFileInputRef}
                          style={{ display: 'none' }}
                          onChange={e => {
                            const files = Array.from(e.target.files || []);
                            setAddAttachments(prev => [
                              ...prev,
                              ...files.map(f => ({ url: URL.createObjectURL(f), name: f.name }))
                            ]);
                            e.target.value = '';
                          }}
                        />
                        {addAttachments.length > 0 && (
                          <ul className="flex flex-wrap gap-2 ml-2">
                            {addAttachments.map((file, i) => (
                              <li key={i} className="bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 text-xs flex items-center gap-1">
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{file.name}</a>
                                <button type="button" onClick={() => setAddAttachments(files => files.filter((_, idx) => idx !== i))}>
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-600"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button type="submit" variant="primary">Save</Button>
                    <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                  </div>
                </form>
              </div>
            </div>
          </Dialog>
        </div>
      ) : null}
      <Card>
        <div className="flex items-center gap-4 mb-4">
          <Input placeholder="Search policies..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="select" value={filter} onChange={e => setFilter(e.target.value as PolicyState)}>
            <option value="">All States</option>
            {states.map(state => <option key={state} value={state}>{state}</option>)}
          </select>
        </div>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Owner</th>
              <th>Effective</th>
              <th>Review</th>
              <th>Version</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPolicies.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-2 text-center text-muted">No policies found.</td>
              </tr>
            ) : (
              paginatedPolicies.map((policy) => (
                <tr key={policy._id}>
                  <td>{policy.name}</td>
                  <td>{policy.description}</td>
                  <td>{policy.owner?.userEmail}</td>
                  <td>{policy.effectiveDate ? new Date(policy.effectiveDate).toLocaleDateString() : <span className="text-muted">N/A</span>}</td>
                  <td>{policy.reviewDate ? new Date(policy.reviewDate).toLocaleDateString() : <span className="text-muted">N/A</span>}</td>
                  <td>{policy.version}</td>
                  <td>{policy.category}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => openEditModal(policy)}>Edit</Button>
                      <Button variant="danger" onClick={() => setDeleteModal({ open: true, policy })}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
      {/* Pagination and row count dropdown */}
      <div className="flex items-center gap-4 mt-4">
        <label>Rows per page:</label>
        <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border rounded p-1 bg-white text-black dark:bg-gray-800 dark:text-white">
          {[5, 10, 20, 50].map(n => <option key={n} value={n} className="bg-white text-black dark:bg-gray-800 dark:text-white">{n}</option>)}
        </select>
        <span>Page {currentPage} of {totalPages}</span>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>&lt;</button>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>&gt;</button>
      </div>
      {/* Comment Modal */}
      <Dialog open={commentModal.open} onClose={() => { setCommentModal({ open: false, policyId: null }); setModalPolicy(null); }} as={Fragment}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <Dialog.Panel className="bg-white dark:bg-gray-900 rounded-xl p-8 w-full max-w-lg shadow-xl relative">
            <Dialog.Title className="text-xl font-bold mb-4">Comments</Dialog.Title>
            {modalPolicy && (
              <div>
                <ul className="mb-4">
                  {modalPolicy.comments?.map((c, i) => (
                    <li key={c._id || i} className="flex items-center gap-2 mb-2">
                      {editingCommentId === c._id ? (
                        <>
                          <input
                            type="text"
                            value={editingText}
                            onChange={e => setEditingText(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEditComment(c._id);
                              if (e.key === 'Escape') { setEditingCommentId(null); setEditingText(""); }
                            }}
                            className="border rounded p-1 text-xs flex-1"
                            autoFocus
                          />
                          <button className="text-blue-600 text-xs font-semibold" onClick={() => saveEditComment(c._id)} title="Save">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          </button>
                          <button className="text-muted text-xs ml-1" onClick={() => { setEditingCommentId(null); setEditingText(""); }} title="Cancel">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1">{c.text}</span>
                          {(user?.id === c.userId || role === 'Admin') && (
                            <>
                              <button className="text-blue-600 text-xs font-semibold" onClick={() => { setEditingCommentId(c._id); setEditingText(c.text); }} title="Edit">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.25 2.25 0 113.182 3.182L7.5 20.213l-4.182 1.045a.75.75 0 01-.91-.91L3.455 16.18 16.862 4.487z" /></svg>
                              </button>
                              <button className="text-red-600 text-xs font-semibold" onClick={() => deleteComment(c._id)} title="Delete">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                <form onSubmit={e => { e.preventDefault(); addComment(); }}>
                  <input name="comment" type="text" placeholder="Add comment" className="border rounded p-1 mr-2 w-2/3" value={newComment} onChange={e => setNewComment(e.target.value)} />
                  <Button type="submit" variant="primary">Add</Button>
                </form>
              </div>
            )}
            <button className="absolute top-2 right-2 text-muted hover:text-primary text-2xl" onClick={() => { setCommentModal({ open: false, policyId: null }); setModalPolicy(null); }} aria-label="Close">&times;</button>
          </Dialog.Panel>
        </div>
      </Dialog>
      {/* Delete Policy Modal */}
      <Dialog open={deleteModal.open} onClose={() => setDeleteModal({ open: false, policy: null })} as={Fragment}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <Dialog.Panel className="bg-white dark:bg-gray-900 rounded-xl p-8 w-full max-w-md shadow-xl relative">
            <Dialog.Title className="text-xl font-bold mb-4">Delete Policy</Dialog.Title>
            <div className="mb-4">Are you sure you want to delete the policy <span className="font-semibold">{deleteModal.policy?.name}</span>? This action cannot be undone.</div>
            <div className="flex gap-4 justify-end">
              <Button variant="secondary" onClick={() => setDeleteModal({ open: false, policy: null })}>Cancel</Button>
              <Button variant="primary" onClick={async () => {
                if (deleteModal.policy) {
                  await fetch('/api/policies', {
                    method: 'DELETE',
                    headers: {
                      'Content-Type': 'application/json',
                      ...(user ? {
                        'x-user-id': user.id,
                        'x-user-email': user.primaryEmailAddress?.emailAddress || '',
                      } : {}),
                    },
                    body: JSON.stringify({ id: deleteModal.policy._id }),
                  });
                  setDeleteModal({ open: false, policy: null });
                  fetchPolicies();
                }
              }}>Delete</Button>
            </div>
            <button className="absolute top-2 right-2 text-muted hover:text-primary text-2xl" onClick={() => setDeleteModal({ open: false, policy: null })} aria-label="Close">&times;</button>
          </Dialog.Panel>
        </div>
      </Dialog>
      {/* Edit Policy Modal */}
      <Dialog open={editModal.open} onClose={() => setEditModal({ open: false, policy: null })} as={Fragment}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <Dialog.Panel className="bg-white dark:bg-gray-900 rounded-xl p-8 w-full max-w-2xl shadow-xl relative">
            <Dialog.Title className="text-xl font-bold mb-4">Edit Policy</Dialog.Title>
            <form onSubmit={e => { e.preventDefault(); saveEditPolicy(); }} className="flex flex-col gap-3">
              <Input name="name" placeholder="Policy Name" required value={editForm.name} onChange={handleEditChange} />
              <Input name="description" placeholder="Description" required value={editForm.description} onChange={handleEditChange} />
              <Input name="effectiveDate" type="date" placeholder="Effective Date" required value={editForm.effectiveDate} onChange={handleEditChange} />
              <Input name="reviewDate" type="date" placeholder="Review Date" required value={editForm.reviewDate} onChange={handleEditChange} />
              <Input name="version" placeholder="Version" required value={editForm.version} onChange={handleEditChange} />
              <select name="category" className="select" required value={editForm.category} onChange={handleEditCategoryChange}>
                <option value="">Select category...</option>
                {commonCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="flex gap-4 items-end">
                <div className="flex flex-col flex-1">
                  <label className="block mb-1 font-medium">Attachments</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (editModal.policy) openAttachmentModal(editModal.policy);
                      }}
                      title="Manage attachments"
                      className="p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0v9A2.25 2.25 0 0113.5 20.25h-3A2.25 2.25 0 018.25 18V9m7.5 0H8.25" /></svg>
                    </button>
                    {Array.isArray(editModal.policy?.attachments) && editModal.policy.attachments.length === 1 && (
                      <a
                        href={editModal.policy.attachments[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-xs text-blue-400 underline truncate max-w-[120px]"
                      >
                        {editModal.policy.attachments[0].name}
                      </a>
                    )}
                    {Array.isArray(editModal.policy?.attachments) && editModal.policy.attachments.length > 1 && (
                      <span className="ml-1 text-xs text-blue-400">({editModal.policy.attachments.length})</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit" variant="primary">Save</Button>
                <Button type="button" variant="secondary" onClick={() => setEditModal({ open: false, policy: null })}>Cancel</Button>
              </div>
            </form>
            <button className="absolute top-2 right-2 text-muted hover:text-primary text-2xl" onClick={() => setEditModal({ open: false, policy: null })} aria-label="Close">&times;</button>
          </Dialog.Panel>
        </div>
      </Dialog>
      {/* Attachments Modal */}
      <Dialog open={attachmentModal.open} onClose={() => setAttachmentModal({ open: false, policy: null })} as={Fragment}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <Dialog.Panel className="bg-white dark:bg-gray-900 rounded-xl p-8 w-full max-w-lg shadow-xl relative">
            <Dialog.Title className="text-xl font-bold mb-4">Attachments</Dialog.Title>
            {attachmentModal.policy && (
              <div>
                <ul className="mb-4">
                  {(attachmentModal.policy.attachments || []).length === 0 && (
                    <li className="text-muted">No attachments.</li>
                  )}
                  {(attachmentModal.policy.attachments || []).map((file, i) => (
                    <li key={i} className="flex items-center gap-2 mb-2">
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{file.name}</a>
                      <button className="text-red-600 text-xs font-semibold" onClick={() => handleAttachmentModalDelete(i)} title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 mt-2">
                  <button type="button" onClick={() => attachmentFileInputRef.current?.click()} title="Upload attachments" className="p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0v9A2.25 2.25 0 0113.5 20.25h-3A2.25 2.25 0 018.25 18V9m7.5 0H8.25" /></svg>
                  </button>
                  <input
                    type="file"
                    multiple
                    ref={attachmentFileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleAttachmentModalAdd}
                  />
                </div>
              </div>
            )}
            <button className="absolute top-2 right-2 text-muted hover:text-primary text-2xl" onClick={() => setAttachmentModal({ open: false, policy: null })} aria-label="Close">&times;</button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
} 