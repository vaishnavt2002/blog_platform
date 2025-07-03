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

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await blogApi.getPosts({ author: user.id });
        setPosts(response.data);
      } catch (err) {
        setError('Failed to fetch posts');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [user, navigate]);

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
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
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');

      const response = await blogApi.getPosts({ author: user.id });
      setPosts(response.data);
    } catch (err) {
      setError(editPostId ? 'Failed to update post' : 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditPostId(post.id);
    setFormData({
      title: post.title,
      content: post.content,
      image: null,
      file: null,
    });
  };

  const handleDelete = async (id) => {
    try {
      await blogApi.deletePost(id);
      setPosts(posts.filter((post) => post.id !== id));
    } catch (err) {
      setError('Failed to delete post');
    }
  };

  const handleCancelEdit = () => {
    setEditPostId(null);
    setFormData({ title: '', content: '', image: null, file: null });
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => input.value = '');
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
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-slate-800 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h2 className="text-xl font-medium text-slate-800 mb-2">{post.title}</h2>
                <p className="text-slate-600 mb-4 line-clamp-3">{post.content}</p>
                <p className="text-slate-500 text-sm mb-4">
                  Views: {post.read_count} | Likes: {post.likes_count}
                </p>
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
                  <button
                    onClick={() => handleEdit(post)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;