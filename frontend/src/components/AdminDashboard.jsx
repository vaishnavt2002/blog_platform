import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import blogApi from '../api/blogApi';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !user.is_staff) {
      navigate('/login');
      return;
    }
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const response = await blogApi.getComments();
        setComments(response.data);
      } catch (err) {
        setError('Failed to fetch comments');
      } finally {
        setIsLoading(false);
      }
    };
    fetchComments();
  }, [user, navigate]);

  const handleApprove = async (id) => {
    try {
      await blogApi.approveComment(id);
      const response = await blogApi.getComments();
      setComments(response.data);
    } catch (err) {
      setError('Failed to approve comment');
    }
  };

  const handleBlock = async (id) => {
    try {
      await blogApi.blockComment(id);
      const response = await blogApi.getComments();
      setComments(response.data);
    } catch (err) {
      setError('Failed to block comment');
    }
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
                  onClick={() => handleApprove(comment.id)}
                  className="text-green-600 hover:text-green-800"
                  disabled={comment.is_approved}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleBlock(comment.id)}
                  className="text-red-600 hover:text-red-800"
                  disabled={!comment.is_approved}
                >
                  Block
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;