import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/NavBar';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Loading from './components/Loading';

import ForgotPassword from './components/ForgotPassword';
import PostList from './components/PostList';
import MyPosts from './components/MyPosts';
import PostDetail from './components/PostDetail';
import AdminDashboard from './components/AdminDashboard';
import Profile from './components/Profile';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <Loading />;
  }

  return (
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } 
          />
          <Route 
            path='/posts'
            element={
              <ProtectedRoute>
                <PostList/>
              </ProtectedRoute>
            }
          />
          <Route 
            path='/profile'
            element={
              <ProtectedRoute>
                <Profile/>
              </ProtectedRoute>
            }
          />
          <Route 
            path='/my-posts'
            element={
              <ProtectedRoute>
                <MyPosts/>
              </ProtectedRoute>
            }
          />
          <Route 
            path='/posts/:id'
            element={
              <ProtectedRoute>
                <PostDetail/>
              </ProtectedRoute>
            }
          />
          <Route 
            path='/admin'
            element={
              <ProtectedRoute>
                <AdminDashboard/>
              </ProtectedRoute>
            }
          />
        </Routes>
        </>
  );
}

export default App;

