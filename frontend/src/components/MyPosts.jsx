import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import blogApi from '../api/blogApi';

const MyPosts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '', image: null, file: null });
  const [editPostId, setEditPostId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async (currentPage = 1) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await blogApi.getMyPost({ page: currentPage });
      if (response.data.results) {
        setPosts(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10));
      } else {
        setPosts(Array.isArray(response.data) ? response.data : []);
        setTotalPages(1);
      }
    } catch (err) {
      setError('Failed to fetch posts');
      setPosts([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPosts(page);
  }, [user, navigate, page]);

  const validateForm = (data) => {
    const errors = {};
    const titleRegex = /^[a-zA-Z0-9]/;
    
    if (!data.title) {
      errors.title = 'Title is required';
    } else if (data.title.length < 5) {
      errors.title = 'Title must be at least 5 characters long';
    } else if (!titleRegex.test(data.title)) {
      errors.title = 'Title must start with a letter or number';
    }

    if (!data.content) {
      errors.content = 'Content is required';
    } else if (data.content.length < 5) {
      errors.content = 'Content must be at least 5 characters long';
    } else if (!titleRegex.test(data.content)) {
      errors.content = 'Content must start with a letter or number';
    }

    if (data.image) {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validImageTypes.includes(data.image.type)) {
        errors.image = 'Image must be in JPG, JPEG, PNG, or GIF format';
      }
      if (data.image.size > 5 * 1024 * 1024) {
        errors.image = 'Image file size must be less than 5MB';
      }
    }

    if (data.file) {
      if (data.file.type !== 'application/pdf') {
        errors.file = 'File must be in PDF format';
      }
      if (data.file.size > 10 * 1024 * 1024) {
        errors.file = 'PDF file size must be less than 10MB';
      }
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (e.target.type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      if (formData.image) data.append('image', formData.image);
      if (formData.file) data.append('file', formData.file);

      if (editPostId) {
        await blogApi.updatePost(editPostId, data);
        setEditPostId(null);
      } else {
        await blogApi.createPost(data);
      }

      setFormData({ title: '', content: '', image: null, file: null });
      setValidationErrors({});
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');

      await fetchPosts(page);
      setError('');
    } catch (err) {
      setError(editPostId ? 'Failed to update post' : 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditPostId(null);
    setFormData({ title: '', content: '', image: null, file: null });
    setValidationErrors({});
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => input.value = '');
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-light text-slate-800 tracking-tight mb-8">
          {editPostId ? 'Edit Post' : 'My Posts'}
        </h1>
        
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mb-12 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent ${
                validationErrors.title ? 'border-red-400' : 'border-slate-200'
              }`}
            />
            {validationErrors.title && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent ${
                validationErrors.content ? 'border-red-400' : 'border-slate-200'
              }`}
              rows="6"
            ></textarea>
            {validationErrors.content && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.content}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600">Image</label>
            <input
              type="file"
              name="image"
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent ${
                validationErrors.image ? 'border-red-400' : 'border-slate-200'
              }`}
              accept="image/jpeg,image/jpg,image/png,image/gif"
            />
            {validationErrors.image && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.image}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600">File</label>
            <input
              type="file"
              name="file"
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent ${
                validationErrors.file ? 'border-red-400' : 'border-slate-200'
              }`}
              accept="application/pdf"
            />
            {validationErrors.file && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.file}</p>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (editPostId ? 'Updating...' : 'Creating...') : (editPostId ? 'Update Post' : 'Create Post')}
            </button>
            {editPostId && (
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
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-slate-800 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-600 mt-4">Loading posts...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <article key={post.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
                    {post.image_url && (
                      <div className="w-full h-48 bg-slate-100 mb-4">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-contain bg-white rounded-lg"
                        />
                      </div>
                    )}
                    <h2 className="text-xl font-medium text-slate-800 mb-2">{post.title}</h2>
                    <p className="text-slate-600 mb-4 leading-relaxed">{truncateContent(post.content)}</p>
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <span>Views: {post.read_count}</span>
                        <span>Likes: {post.likes_count}</span>
                      </div>
                    </div>
                    {post.file_url && (
                      <div className="mb-4">
                        <a
                          href={post.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          📎 View attached file
                        </a>
                      </div>
                    )}
                    <div className="flex space-x-4">
                      <Link
                        to={`/posts/${post.id}`}
                        className="text-slate-600 hover:text-slate-800 hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-600 text-lg">No posts found.</p>
                  <p className="text-slate-500 text-sm mt-2">Create your first post using the form above.</p>
                </div>
              )}
            </div>
            
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center space-x-4">
                <button 
                  onClick={handlePrevPage} 
                  disabled={page === 1}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors duration-200"
                >
                  Previous
                </button>
                <span className="text-slate-600 px-4">
                  Page {page} of {totalPages}
                </span>
                <button 
                  onClick={handleNextPage} 
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyPosts;