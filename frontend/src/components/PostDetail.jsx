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

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      setError('');
      try {
        await blogApi.incrementReadCount(id);
        const response = await blogApi.getPost(id);
        setPost(response.data);
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
      setComments(commentsResponse.data.filter(comment => comment.is_approved));
    } catch (err) {
      setError('Failed to submit comment');
      console.error('Error submitting comment:', err);
    }
  };

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
        <h1 className="text-3xl font-light text-slate-800 tracking-tight mb-4">{post.title}</h1>
        {post.image && (
          <img src={post.image} alt={post.title} className="w-full h-64 object-cover rounded-lg mb-6" />
        )}
        <p className="text-slate-500 mb-4">By {post.author.email} | Views: {post.read_count} | Likes: {post.likes_count}</p>
        <div className="prose max-w-none text-slate-700 mb-8">{post.content}</div>
        {post.file && (
          <a href={post.file} className="text-slate-600 hover:text-slate-800 hover:underline mb-6 block">
            Download Attachment
          </a>
        )}
        {user && (
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition duration-200 mb-6 ${
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
        )}
        <h2 className="text-2xl font-light text-slate-800 mb-4">Comments</h2>
        {user ? (
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
              <p className="text-slate-700">{comment.content}</p>
              <p className="text-slate-500 text-sm">By {comment.user.email} | {new Date(comment.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;