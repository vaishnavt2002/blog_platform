import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import blogApi from '../api/blogApi';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [userFormData, setUserFormData] = useState({ email: '', first_name: '', last_name: '', is_staff: false });
  const [editUserId, setEditUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('comments');
  // CHANGED: Added state for modal
  const [modal, setModal] = useState({ isOpen: false, action: null, commentId: null });

  useEffect(() => {
    if (!user || !user.is_staff) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'comments') {
          // CHANGED: Fetch pending comments from admin/comments endpoint
          const response = await blogApi.getPendingComments();
          setComments(response.data);
        } else if (activeTab === 'users') {
          const response = await blogApi.getUsers();
          setUsers(response.data);
        }
      } catch (err) {
        setError(`Failed to fetch ${activeTab}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, navigate, activeTab]);

  const handleApproveComment = async (id) => {
    try {
      await blogApi.approveComment(id);
      const response = await blogApi.getPendingComments();
      setComments(response.data);
    } catch (err) {
      setError('Failed to approve comment');
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await blogApi.deleteComment(id);
      const response = await blogApi.getPendingComments();
      setComments(response.data);
    } catch (err) {
      setError('Failed to delete comment');
    }
  };

  // CHANGED: Added modal confirmation handler
  const openModal = (action, commentId) => {
    setModal({ isOpen: true, action, commentId });
  };

  const closeModal = () => {
    setModal({ isOpen: false, action: null, commentId: null });
  };

  const confirmAction = async () => {
    try {
      if (modal.action === 'approve') {
        await handleApproveComment(modal.commentId);
      } else if (modal.action === 'delete') {
        await handleDeleteComment(modal.commentId);
      }
      closeModal();
    } catch (err) {
      setError(`Failed to ${modal.action} comment`);
    }
  };

  const handleCancelEdit = () => {
    setEditUserId(null);
    setUserFormData({ email: '', first_name: '', last_name: '', is_staff: false });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-slate-800 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-light text-slate-800 tracking-tight mb-8">Admin Dashboard</h1>
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        <div className="mb-8 flex space-x-4">
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'comments' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-800'}`}
          >
            Manage Comments
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'users' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-800'}`}
          >
            Users
          </button>
        </div>

        {activeTab === 'comments' && (
          <>
            <h2 className="text-2xl font-light text-slate-800 mb-4">Pending Comments</h2>
            <div className="grid gap-6">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-slate-700">{comment.content}</p>
                    <p className="text-slate-500 text-sm">
                      By {comment.user.email} on Post {comment.post} | Status: Pending
                    </p>
                    <div className="mt-4 flex space-x-4">
                      <button
                        onClick={() => openModal('approve', comment.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openModal('delete', comment.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-600">No pending comments.</p>
              )}
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <h2 className="text-2xl font-light text-slate-800 mb-4">Users</h2>
            <div className="grid gap-6">
              {users.map((user) => (
                <div key={user.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <p className="text-slate-700">{user.email}</p>
                  <p className="text-slate-500 text-sm">
                    {user.username} {user.is_staff ? '(Admin)' : '(User)'}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {modal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-medium text-slate-800 mb-4">
                Confirm {modal.action === 'approve' ? 'Approval' : 'Deletion'}
              </h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to {modal.action} this comment?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`px-4 py-2 rounded-lg ${
                    modal.action === 'approve'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {modal.action === 'approve' ? 'Approve' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;