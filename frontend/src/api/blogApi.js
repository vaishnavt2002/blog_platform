import axiosInstance from './axiosInstance';

const blogApi = {
  getPosts: (params = {}) => axiosInstance.get('/posts/', { params }),
  getPost: (id) => axiosInstance.get(`/posts/${id}/`),
  incrementReadCount: (id) => axiosInstance.get(`/posts/${id}/increment_read_count/`),
  createPost: (data) => axiosInstance.post('/posts/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updatePost: (id, data) => axiosInstance.put(`/posts/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deletePost: (id) => axiosInstance.delete(`/posts/${id}/`),
  likePost: (id) => axiosInstance.post(`/posts/${id}/like/`),
  getComments: (postId) => axiosInstance.get(postId ? `/comments/?post=${postId}` : '/comments/'),
  createComment: (data) => axiosInstance.post('/comments/', data),
  approveComment: (id) => axiosInstance.post(`/comments/${id}/approve/`),
  blockComment: (id) => axiosInstance.post(`/comments/${id}/block/`),
};

export default blogApi;