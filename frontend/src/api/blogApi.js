import axiosInstance from './axiosInstance';

const blogApi = {
  getPosts: (params = {}) => axiosInstance.get('/posts/', { params }),
  getPost: (id) => axiosInstance.get(`/posts/${id}/`),
  getMyPost: (params = {}) => axiosInstance.get('/posts/my_posts/', { params }),
  incrementReadCount: (id) => axiosInstance.post(`/posts/${id}/increment_read_count/`),
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
  getUsers: (params = {}) => axiosInstance.get('/users/', { params }),
  createUser: (data) => axiosInstance.post('/users/', data),
  updateUser: (id, data) => axiosInstance.put(`/users/${id}/`, data),
  deleteUser: (id) => axiosInstance.delete(`/users/${id}/`),
};

export default blogApi;