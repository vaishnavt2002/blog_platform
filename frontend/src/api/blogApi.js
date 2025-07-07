import axiosInstance from './axiosInstance';

const blogApi = {
  getPosts: (params = {}) => axiosInstance.get('/blog/posts/', { params }),
  getPost: (id) => axiosInstance.get(`/blog/posts/${id}/`),
  getMyPost: (params = {}) => axiosInstance.get('/blog/posts/my_posts/', { params }),
  incrementReadCount: (id) => axiosInstance.post(`/blog/posts/${id}/increment_read_count/`),
  createPost: (data) => axiosInstance.post('/blog/posts/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updatePost: (id, data) => axiosInstance.put(`/blog/posts/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deletePost: (id) => axiosInstance.delete(`/blog/posts/${id}/`),
  likePost: (id) => axiosInstance.post(`/blog/posts/${id}/like/`),
  getComments: (postId) => axiosInstance.get(postId ? `/blog/comments/?post=${postId}` : '/blog/comments/'),
  createComment: (data) => axiosInstance.post('/blog/comments/', data),
  getPendingComments: () => axiosInstance.get('/blog/admin/comments/'),
  approveComment: (id) => axiosInstance.post(`/blog/admin/comments/${id}/approve/`),
  deleteComment: (id) => axiosInstance.delete(`/blog/admin/comments/${id}/`),
  blockComment: (id) => axiosInstance.post(`/blog/admin/comments/${id}/block/`),
  getUsers: (params = {}) => axiosInstance.get('/blog/users/', { params }),
};

export default blogApi;