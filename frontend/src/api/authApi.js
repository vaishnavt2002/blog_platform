import axiosInstance from "./axiosInstance"




const authApi = {
  register: (data) => axiosInstance.post('/auth/register/', data),
  requestOTP: (data) => axiosInstance.post('/auth/otp/request/', data),
  verifyOTP: (data) => axiosInstance.post('/auth/otp/verify/', data),
  login: async (data) => {
    try {
      const response = await axiosInstance.post('auth/login/', data);
      console.log('Login response headers:', response.headers);
      console.log('Login response data:', response.data);
      return response;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },
  getProfile: () => axiosInstance.get('/auth/profile/'),
  updateProfile: (data) => axiosInstance.put('/auth/profile/', data),
  logOut: () => axiosInstance.post('/auth/logout/'),
  forgotPassword: (data) => axiosInstance.post('/auth/forgot-password/', data),
  resetPassword: (data) => axiosInstance.post('/auth/forgot-password/reset/', data),
};
export default authApi