import React, { useEffect, useState } from "react";
import blogApi from "../api/blogApi";
import { Link } from "react-router-dom";

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await blogApi.getPosts({ search: searchQuery, page});
        setPosts(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10));
      } catch (err) {
        setError('Failed to fetch posts');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [searchQuery, page]);
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-light text-slate-800 mb-8">Blog Posts</h1>
        
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        <div className="mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by title, content, or author email..."
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          />
        </div>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-slate-800 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-600 mt-4">Loading posts...</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                {post.image_url && (
                  <div className="w-full h-64 bg-slate-100">
                    <img 
                      src={post.image_url} 
                      alt={post.title} 
                      className="w-full h-full object-contain bg-white"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-800 mb-3">
                    {post.title}
                  </h2>
                  
                  <p className="text-slate-600 mb-4 leading-relaxed">
                    {truncateContent(post.content)}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span>Views: {post.read_count}</span>
                      <span>Likes: {post.likes_count}</span>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/posts/${post.id}`} 
                    className="inline-block px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200"
                  >
                    Read More
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <div className="mt-8 flex justify-center">
        <button onClick={handlePrevPage} disabled={page===1}
        className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50">Previous</button>
        <span className="text-slate-600">Page {page} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={page === totalPages}
        className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50">Next</button>
      </div>
    </div>
  );
};

export default PostList;