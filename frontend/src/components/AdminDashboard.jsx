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

  useEffect(() => {
    if (!user || !user.is_staff) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'comments') {
          const response = await blogApi.getComments();
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

  const handleUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserFormData({ ...userFormData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editUserId) {
        await blogApi.updateUser(editUserId, userFormData);
        setEditUserId(null);
      } else {
        await blogApi.createUser(userFormData);
      }
      setUserFormData({ email: '', first_name: '', last_name: '', is_staff: false });
      const response = await blogApi.getUsers();
      setUsers(response.data);
    } catch (err) {
      setError(editUserId ? 'Failed to update user' : 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditUserId(user.id);
    setUserFormData({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_staff: user.is_staff,
    });
  };

  const handleDeleteUser = async (id) => {
    try {
      await blogApi.deleteUser(id);
      setUsers(users.filter((user) => user.id !== id));
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleApproveComment = async (id) => {
    try {
      await blogApi.approveComment(id);
      const response = await blogApi.getComments();
      setComments(response.data);
    } catch (err) {
      setError('Failed to approve comment');
    }
  };

  const handleBlockComment = async (id) => {
    try {
      await blogApi.blockComment(id);
      const response = await blogApi.getComments();
      setComments(response.data);
    } catch (err) {
      setError('Failed to block comment');
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
            Manage Users
          </button>
        </div>

        {activeTab === 'comments' && (
          <>
            <h2 className="text-2xl font-light text-slate-800 mb-4">Manage Comments</h2>
            <div className="grid gap-6">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <p className="text-slate-700">{comment.content}</p>
                  <p className="text-slate-500 text-sm">
                    By {comment.user.email} on Post {comment.post} | Status: {comment.is_approved ? 'Approved' : 'Pending/Blocked'}
                  </p>
                  <div className="mt-4 flex space-x-4">
                    <button
                      onClick={() => handleApproveComment(comment.id)}
                      className="text-green-600 hover:text-green-800"
                      disabled={comment.is_approved}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleBlockComment(comment.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={!comment.is_approved}
                    >
                      Block
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <h2 className="text-2xl font-light text-slate-800 mb-4">Manage Users</h2>
            <form onSubmit={handleUserSubmit} className="mb-12 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600">Email</label>
                <input
                  type="email"
                  name="email"
                  value={userFormData.email}
                  onChange={handleUserChange}
                  className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={userFormData.first_name}
                  onChange={handleUserChange}
                  className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={userFormData.last_name}
                  onChange={handleUserChange}
                  className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600">
                  <input
                    type="checkbox"
                    name="is_staff"
                    checked={userFormData.is_staff}
                    onChange={handleUserChange}
                    className="mr-2"
                  />
                  Admin Status
                </label>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (editUserId ? 'Updating...' : 'Creating...') : (editUserId ? 'Update User' : 'Create User')}
                </button>
                {editUserId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            <div className="grid gap-6">
              {users.map((user) => (
                <div key={user.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <p className="text-slate-700">{user.email}</p>
                  <p className="text-slate-500 text-sm">
                    {user.first_name} {user.last_name} | {user.is_staff ? 'Admin' : 'User'}
                  </p>
                  <div className="mt-4 flex space-x-4">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;