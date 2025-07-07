import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import blogApi from '../api/blogApi';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', image: null, file: null });
  const [modal, setModal] = useState({ isOpen: false, action: '', targetId: null });
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      setError('');
      try {
        await blogApi.incrementReadCount(id);
        const response = await blogApi.getPost(id);
        setPost(response.data);
        setFormData({
          title: response.data.title,
          content: response.data.content,
          image: null,
          file: null,
        });
        const commentsResponse = await blogApi.getComments(id);
        setComments(commentsResponse.data);
      } catch (err) {
        setError('Failed to fetch post or comments');
        console.error('Error fetching post:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setFormData({
      title: post.title,
      content: post.content,
      image: null,
      file: null,
    });
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => input.value = '');
  };

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      if (formData.image) data.append('image', formData.image);
      if (formData.file) data.append('file', formData.file);

      await blogApi.updatePost(id, data);
      const response = await blogApi.getPost(id);
      setPost(response.data);
      setEditMode(false);
      setError('');
    } catch (err) {
      setError('Failed to update post');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (action, targetId = null) => {
    setModal({ isOpen: true, action, targetId });
  };

  const closeModal = () => {
    setModal({ isOpen: false, action: '', targetId: null });
  };

  const confirmAction = async () => {
    if (modal.action === 'delete-post') {
      try {
        await blogApi.deletePost(id);
        navigate('/my-posts');
      } catch (err) {
        setError('Failed to delete post');
      }
    } else if (modal.action === 'delete-comment') {
      try {
        await blogApi.deleteComment(modal.targetId);
        const commentsResponse = await blogApi.getComments(id);
        setComments(commentsResponse.data);
      } catch (err) {
        setError('Failed to delete comment');
      }
    }
    closeModal();
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await blogApi.likePost(id);
      const response = await blogApi.getPost(id);
      setPost(response.data);
    } catch (err) {
      setError('Failed to like/unlike post');
      console.error('Error liking post:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await blogApi.createComment({ post: id, content: commentContent });
      setCommentContent('');
      const commentsResponse = await blogApi.getComments(id);
      setComments(commentsResponse.data);
    } catch (err) {
      setError('Failed to submit comment');
      console.error('Error submitting comment:', err);
    }
  };

  const handleEditComment = (comment) => {
    setEditCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  const handleCancelEditComment = () => {
    setEditCommentId(null);
    setEditCommentContent('');
  };

  const handleUpdateComment = async (e, commentId) => {
    e.preventDefault();
    try {
      await blogApi.updateComment(commentId, { content: editCommentContent, post: id });
      setEditCommentId(null);
      setEditCommentContent('');
      const commentsResponse = await blogApi.getComments(id);
      setComments(commentsResponse.data);
    } catch (err) {
      setError('Failed to update comment');
      console.error('Error updating comment:', err);
    }
  };

  const isOwnPost = user && post?.author?.email === user.email;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-slate-800 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {editMode ? (
          <form onSubmit={handleUpdate} className="mb-12 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h1 className="text-3xl font-light text-slate-800 tracking-tight mb-8">Edit Post</h1>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600">Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                rows="6"
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600">Image</label>
              <input
                type="file"
                name="image"
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                accept="image/*"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600">File</label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Post'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="text-3xl font-light text-slate-800 tracking-tight mb-4">{post.title}</h1>
            {post.image_url && (
              <div className="w-full h-64 bg-slate-100 mb-6">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-contain bg-white rounded-lg"
                />
              </div>
            )}
            <p className="text-slate-500 mb-4">By {post.author.email} | Views: {post.read_count} | Likes: {post.likes_count}</p>
            <div className="prose max-w-none text-slate-700 mb-8">{post.content}</div>
            {post.file_url && (
              <div className="mb-6">
                <a
                  href={post.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 border border-slate-300 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828L18 9.828V15m0 0H13m5 0V9m-9-5h6m-3 3v6"></path>
                  </svg>
                  Open Attachment
                </a>
              </div>
            )}
            {user && (
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition duration-200 ${
                    post.is_liked 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  {post.is_liked ? (
                    <>
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      Liked
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                      Like
                    </>
                  )}
                </button>
                {isOwnPost && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openModal('delete-post')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
            <h2 className="text-2xl font-light text-slate-800 mb-4">Comments</h2>
            {user && !isOwnPost ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400"
                  rows="4"
                  placeholder="Add a comment..."
                  required
                ></textarea>
                <button
                  type="submit"
                  className="mt-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
                >
                  Submit Comment
                </button>
              </form>
            ) : isOwnPost ? (
              <p className="text-slate-600 mb-6">You cannot comment on your own post.</p>
            ) : (
              <p className="text-slate-600 mb-6">
                <Link to="/login" className="text-slate-600 hover:text-slate-800 hover:underline">
                  Login
                </Link>{' '}
                to add a comment.
              </p>
            )}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                  {editCommentId === comment.id ? (
                    <form onSubmit={(e) => handleUpdateComment(e, comment.id)} className="mb-4">
                      <textarea
                        value={editCommentContent}
                        onChange={(e) => setEditCommentContent(e.target.value)}
                        className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400"
                        rows="3"
                        required
                      ></textarea>
                      <div className="flex space-x-4 mt-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
                        >
                          Update Comment
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditComment}
                          className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="text-slate-700">{comment.content}</p>
                      <p className="text-slate-500 text-sm">
                        By {comment.user.email} | {new Date(comment.created_at).toLocaleDateString()}
                        {user && comment.user.email === user.email && !comment.is_approved && (
                          <span className="text-yellow-600 ml-2"> (Pending Approval)</span>
                        )}
                      </p>
                      {user && comment.user.email === user.email && (
                        <div className="flex space-x-4 mt-2">
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openModal('delete-comment', comment.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        {modal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-medium text-slate-800 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this {modal.action === 'delete-post' ? 'post' : 'comment'}?
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
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail;